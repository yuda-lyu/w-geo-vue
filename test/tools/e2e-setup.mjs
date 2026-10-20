//e2e 共用層: 只放專案組態與專案專屬原語(建置待測 UMD、宿主頁開啟、表格讀取原語)
//共用實作一律經 e2eLib.mjs 引用 w-package-tools-e2e, 本檔與測試檔皆不得自行 chromium.launch
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'
import { launchBrowser, openCasePage, waitGridIdle, pollUntil } from './e2eLib.mjs'


//projRoot, 本模組位於 test/tools/, 上兩層為專案根; 相對路徑一律由此解析
export const projRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const testDir = path.join(projRoot, 'test')

//VIEWPORT, 各案例之確定性視窗
const VIEWPORT = { width: 1400, height: 1000 }


//useTmpDir, 各測試檔專用之中介檔目錄 test/_tmp/<name>/(已 gitignore), 由該檔 after 刪除; 不得使用 ./tmp(AI 代理暫存區, 隨時會被清除)
export function useTmpDir(name) {
    let root = path.join(testDir, '_tmp')
    let dir = path.join(root, name)
    return {
        dir,
        file: (fn) => path.join(dir, fn),
        clean: () => {
            fs.rmSync(dir, { recursive: true, force: true })
            //test/_tmp 已無其他測試檔之目錄時一併移除; 並行之另一檔可能正要建立, 失敗即略過
            try {
                if (fs.readdirSync(root).length === 0) {
                    fs.rmdirSync(root)
                }
            }
            catch (err) {}
        },
    }
}


//buildUmd, 以現況 src/ 建置 WGeoVue.vue 之 UMD 到指定資料夾(不覆寫版控之 dist/); 宿主頁以 <script> 載入其 w-geo-vue.umd.js
//環境變數 E2E_SRC_COMPONENTS 可改指定另一份 components 資料夾(須位於專案根之下以解析 node_modules), 供變異驗證(把修正拿掉須轉紅)之副本使用
export async function buildUmd(fdTar) {
    let fdSrc = process.env.E2E_SRC_COMPONENTS || path.join(projRoot, 'src', 'components')
    await rollupFiles({
        fns: 'WGeoVue.vue',
        fdSrc: fdSrc + path.sep,
        fdTar,
        nameDistType: 'kebabCase',
        bMinify: false,
        bSourcemap: false,
        bLog: false,
        globals: {
            'vue': 'Vue',
        },
        external: [
            'vue',
        ],
    })
    let fp = path.join(fdTar, 'w-geo-vue.umd.js')
    if (!fs.existsSync(fp)) {
        throw new Error(`build failed, not found: ${fp}`)
    }
    return fp
}


//pageUrl, 宿主頁(test/pages/)之網址
export function pageUrl(name) {
    return pathToFileURL(path.join(testDir, 'pages', name)).href
}


//openPage, 每案例一個新瀏覽器與新頁面(launchBrowser 六旗標), 收集 console 與 pageerror; initRows/initMethods 為載入前設定之首次掛載資料與分析方法勾選
//rows 為 null 時不設定(元件以空列掛載); 有給時於開頁後經 __vm 設定(setup, 非 act)並等表格靜止
export async function openPage(opt = {}) {
    let { viewport = VIEWPORT, rows = null, waitTable = true, initRows = null, initMethods = null } = opt
    let browser = await launchBrowser()
    let ctx = {
        browser,
        page: null,
        logs: [],
        pageErrors: [],
        close: async () => {
            await browser.close()
        },
    }
    try {
        let page = await openCasePage(browser, { contextOptions: { viewport } })
        ctx.page = page
        page.on('console', (m) => ctx.logs.push({ type: m.type(), text: m.text() }))
        page.on('pageerror', (e) => ctx.pageErrors.push(String(e)))
        if (initRows) {
            await page.addInitScript((rs) => {
                window.__initRows = rs
            }, initRows)
        }
        if (initMethods) {
            await page.addInitScript((ms) => {
                window.__initMethods = ms
            }, initMethods)
        }
        await page.goto(pageUrl('liq-analysis.html'))
        await page.waitForFunction(() => !!window.__vm, null, { timeout: 30000 })
        if (rows) {
            await setRows(ctx, rows, { waitTable })
        }
    }
    catch (err) {
        await browser.close()
        throw err
    }
    return ctx
}


//setRows, 換輸入列(經宿主頁 __vm, 屬 setup)
export async function setRows(ctx, rows, opt = {}) {
    let { waitTable = true } = opt
    let { page } = ctx
    await page.evaluate((rs) => {
        window.__vm.rows = rs
    }, rows)
    if (waitTable) {
        await waitGridIdle(page, { minCells: 1, timeout: 30000 })
    }
}


//cellsByCol, 目前已渲染之儲存格文字: { colId: [第0列, 第1列, ...] }(依 row-index 排序, 只取中間欄容器)
export function cellsByCol(page) {
    return page.evaluate(() => {
        let rows = Array.from(document.querySelectorAll('.ag-center-cols-container .ag-row'))
            .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
        let out = {}
        rows.forEach((r, i) => {
            r.querySelectorAll('.ag-cell').forEach((c) => {
                let k = c.getAttribute('col-id')
                if (!out[k]) {
                    out[k] = []
                }
                out[k][i] = c.innerText
            })
        })
        return out
    })
}


//rowCount, 目前顯示之資料列數(過濾後)
export function rowCount(page) {
    return page.evaluate(() => document.querySelectorAll('.ag-center-cols-container .ag-row').length)
}


//headerCell, 某欄之表頭儲存格
export function headerCell(page, colId) {
    return page.locator(`.ag-header-row-column .ag-header-cell[col-id="${colId}"]`)
}


//floatingFilterInput, 某欄表頭下方浮動過濾列之輸入框(浮動過濾格無 col-id, 以與表頭相同之 aria-colindex 對應)
export async function floatingFilterInput(page, colId) {
    let idx = await headerCell(page, colId).getAttribute('aria-colindex')
    return page.locator(`.ag-header-row-column-filter .ag-header-cell[aria-colindex="${idx}"] input:not([disabled])`).first()
}


//typeIntoFloatingFilter, 於某欄浮動過濾列以真鍵盤輸入(L1); 先全選刪除既有內容
//輸入框型別因過濾器而異(數值過濾器為 type=number, 只收數值字元; 文字過濾器為 text), 鍵入內容由瀏覽器依型別接收
export async function typeIntoFloatingFilter(page, colId, text) {
    let input = await floatingFilterInput(page, colId)
    await input.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')
    if (text !== '') {
        await page.keyboard.type(text)
    }
}


//scrollGridX, 於表格中央欄區以真滑鼠滾輪水平捲動(L2); dx 為正向右, 並等表格靜止
export async function scrollGridX(page, dx) {
    let box = await page.locator('.ag-center-cols-viewport').first().boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(dx, 0)
    await waitGridIdle(page, { minCells: 1, stableMs: 300, timeout: 30000 })
}


//colInView, 某欄之表頭儲存格是否已完整落在中央欄區可視範圍內
export function colInView(page, colId) {
    return page.evaluate((c) => {
        let h = document.querySelector(`.ag-header-row-column .ag-header-cell[col-id="${c}"]`)
        let v = document.querySelector('.ag-center-cols-viewport')
        if (!h || !v) {
            return false
        }
        let r = h.getBoundingClientRect()
        let rv = v.getBoundingClientRect()
        return r.left >= rv.left && r.right <= rv.right
    }, colId)
}


//scrollToCol, 以滾輪由左向右逐步捲動直到某欄完整可見(欄寬固定, 欄數多時只渲染可視範圍); 先捲回最左以得確定起點
export async function scrollToCol(page, colId) {
    await scrollGridX(page, -1000000)
    for (let i = 0; i < 80; i++) {
        if (await colInView(page, colId)) {
            return
        }
        await scrollGridX(page, 400)
    }
    throw new Error(`scrollToCol: 欄 ${colId} 未進入可視範圍`)
}


//collectAllCells, 由左至右捲過整個表格, 合併各停點已渲染之儲存格文字(textContent): { colId: [第0列, ...] }
export async function collectAllCells(page) {
    let all = {}
    await scrollGridX(page, -1000000)
    let prev = -1
    for (let i = 0; i < 120; i++) {
        let part = await page.evaluate(() => {
            let rows = Array.from(document.querySelectorAll('.ag-center-cols-container .ag-row'))
                .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            let out = {}
            rows.forEach((r, ri) => {
                r.querySelectorAll('.ag-cell').forEach((c) => {
                    let k = c.getAttribute('col-id')
                    if (!out[k]) {
                        out[k] = []
                    }
                    out[k][ri] = c.textContent
                })
            })
            return out
        })
        Object.assign(all, part)
        let left = await page.evaluate(() => document.querySelector('.ag-center-cols-viewport').scrollLeft)
        if (left === prev) {
            break
        }
        prev = left
        await scrollGridX(page, 600)
    }
    return all
}


//waitRowCount, 等顯示列數等於預期(偵測等待, 用於過濾之後)
export async function waitRowCount(page, n, timeout = 10000) {
    await pollUntil(`顯示列數為 ${n}`, async () => (await rowCount(page)) === n, { timeout, interval: 100 })
}
