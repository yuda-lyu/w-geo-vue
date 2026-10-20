//WSptLiqAnalysis 真瀏覽器 e2e: 對應 建議w-geo-vue修正.md(Gitea issue #8)〈4. 驗證建議〉三項與規則帳本 R01~R05
//待測物為現況 src/ 建置之 UMD(before 建到 test/_tmp/liq-analysis/, after 刪除), 以宿主頁 test/pages/liq-analysis.html 掛載
import fs from 'fs'
import assert from 'assert'
import { mdiDownload } from '@mdi/js'
import getDataFromExcelFileU8Arr from 'wsemi/src/getDataFromExcelFileU8Arr.mjs'
import calcLiquefaction from 'w-geo/src/calcLiquefaction.mjs'
import dig from 'wsemi/src/dig.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import { buildUmd, useTmpDir, openPage, setRows, cellsByCol, rowCount, headerCell, typeIntoFloatingFilter, waitRowCount, scrollToCol, collectAllCells } from './tools/e2e-setup.mjs'
import { waitUntilExist, pollUntil, waitGridIdle } from './tools/e2eLib.mjs'
import { getRowsLiq, getRowsLiqForColType, getRowsLiqForDepthFloat } from './fixtures/rowsLiq.mjs'


//元件預設值(src/components/WSptLiqAnalysis.vue 之 props 預設), 作為顯示語意之獨立期望來源
const KP_TRANS_ROW_KEY = { 'SPTN': 'N60', 'Gt_dry': 'rd', 'Gt_sat': 'rsat', 'ctFine': 'FC', 'code': 'legendCode', 'USCS': 'soilClassification' }
const KP_DIG = {
    'depth': 3,
    'depthStart': 3,
    'depthEnd': 3,
    'waterLevelUsual': 1,
    'waterLevelDesign': 1,
    'N60': 1,
    'WC': 1,
    'PI': 1,
    'PL': 1,
    'LL': 1,
    'S': 2,
    'rd': 2,
    'rsat': 2,
    'sv': 4,
    'svp': 4,
    'svpUsual': 4,
    'svpDesign': 4,
    'D10': 5,
    'D30': 5,
    'D50': 5,
    'D60': 5,
    'ctGravel': 1,
    'ctSand': 1,
    'ctSilt': 1,
    'ctClay': 1,
    'FC': 1,
}
const METHODS = ['sptHBF2017', 'sptNJRA2017']
const KEY_STATE = 'sptHBF2017-stateFS'
const MSG_NO_PGA = 'rows[0].PGA or opt.PGA is not a number'


//calcRows, 同元件之鍵轉換與選項, 直接以 w-geo 計算
function calcRows(rowsIn, methods = METHODS) {
    let rows = rowsIn.map((row) => {
        let r = {}
        Object.keys(row).forEach((k) => {
            r[KP_TRANS_ROW_KEY[k] || k] = row[k]
        })
        return r
    })
    return calcLiquefaction.calc('SPT', rows, { unitSvSvp: 'MPa', methods })
}


//expectCellsFromCalc, 以 w-geo 直接計算(同元件之鍵轉換與選項)並套用[修前之顯示語意]得各欄各列應顯示之文字:
//kpDig 所列欄位值為數字時取位(dig), 其餘字串/數字原樣, 空值為空字串; -err/-stateFS 欄顯示為原字元(元件先轉 HTML 實體再以 HTML 呈現, 使用者所見即原字元)
function expectCellsFromCalc(rowsIn) {
    let out = calcRows(rowsIn)
    let cols = {}
    out.forEach((r, i) => {
        Object.keys(r).forEach((k) => {
            let v = r[k]
            let t
            if (v === null || v === undefined) {
                t = ''
            }
            else if (KP_DIG[k] !== undefined && isnum(v)) {
                t = dig(v, KP_DIG[k])
            }
            else {
                t = String(v)
            }
            if (!cols[k]) {
                cols[k] = []
            }
            cols[k][i] = t
        })
    })
    return cols
}


describe('e2e-liq-analysis', function() {
    this.timeout(180000)

    let tmp = useTmpDir('liq-analysis')

    before(async function() {
        await buildUmd(tmp.dir)
    })

    after(function() {
        tmp.clean()
    })


    //E2E-001 R01: 開頁 console 無「was removed in 2.0.56」警告, 且無 console error(元件不得以舊鍵或例外污染 console)
    it('R01 console無已移除舊鍵警告與錯誤', async function() {
        let ctx = await openPage({ rows: getRowsLiq() })
        try {
            let texts = ctx.logs.map((m) => m.text)
            let removed = texts.filter((t) => /was removed in 2\.0\.56/.test(t))
            assert.deepStrictEqual(removed, [], '不得有 was removed in 2.0.56 警告') //驗證建議1: console 無「was removed in 2.0.56」警告
            let errs = ctx.pageErrors.concat(ctx.logs.filter((m) => m.type === 'error').map((m) => m.text))
            assert.deepStrictEqual(errs, [], 'pageerror 或 console error')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-002 R02: 欄名之 <sub>/<sup> 顯示為下標上標而非 HTML 原碼
    it('R02 欄名顯示為下標上標', async function() {
        let ctx = await openPage({ rows: getRowsLiq() })
        try {
            let { page } = ctx
            await scrollToCol(page, 'rsat')
            let h = headerCell(page, 'rsat')

            //驗證建議1: 欄名顯示為下標上標而非原碼
            assert.strictEqual(await h.locator('sub').count(), 1, 'γ_sat 應有一個 <sub> 元素')
            assert.strictEqual((await h.locator('sub').innerText()).trim(), 'sat')
            assert.strictEqual(await h.locator('sup').count(), 1, 'm3 應轉為一個 <sup> 元素')
            assert.strictEqual((await h.locator('sup').innerText()).trim(), '3')
            let text = (await h.innerText()).replace(/\s+/g, '')
            assert.ok(!/[<>]/.test(text), `欄名不得含 HTML 原碼: ${text}`)
            assert.strictEqual(text, 'γsat(kN/m3)', '欄名可見文字')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-002b R02: 無對應 kpHead 之欄位鍵其表頭為字面文字(不把欄位鍵當 HTML 解析, 同修正前之預設表頭)
    it('R02 無kpHead對應之欄名維持字面文字', async function() {
        let rows = getRowsLiq()
        let kc = 'custom<sup>x</sup>'
        rows[0][kc] = '1'
        let ctx = await openPage({ rows })
        try {
            let { page } = ctx
            await scrollToCol(page, kc)
            let h = headerCell(page, kc)
            assert.strictEqual(await h.locator('sup').count(), 0, '無 kpHead 對應者不得被解析為 <sup> 元素')
            assert.strictEqual((await h.innerText()).trim(), kc, '表頭為欄位鍵字面文字')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-003 R03: 儲存格依 kpDig 取位(depth 由 depthStart/depthEnd 取中點計算, 浮點誤差之長小數須取位顯示)
    it('R03 depth依kpDig取位', async function() {
        let rows = getRowsLiqForDepthFloat()
        assert.strictEqual(String(calcRows(rows)[1].depth), '15.274999999999999', '夾具須確實產生浮點誤差之長小數(issue 實測鑽孔之形態)')
        let ctx = await openPage({ rows })
        try {
            let { page } = ctx

            //驗證建議1: depth 依 kpDig 取位(kpDig.depth=3)
            let cells = await cellsByCol(page)
            assert.strictEqual(cells.depth[1], '15.275', 'depth 取3位')
            assert.strictEqual(cells.depth[0], '7.600', 'depth 取3位並補0')
            assert.strictEqual(cells.depth[2], '17.675', 'depth 取3位')
        }
        finally {
            await ctx.close()
        }
    })


    //hoverTip, 先將游標移開並等既有提示框關閉, 再 hover 目標儲存格(真滑鼠 L3), 回傳 hover 後 1 秒內出現之提示框文字(無則 null)
    async function hoverTip(page, cell, waitShow) {
        await page.mouse.move(0, 0)
        await waitUntilExist(page, '既有提示框已關閉', () => document.querySelectorAll('.tippy-box').length === 0, { timeout: 15000 })
        await cell.hover()
        if (waitShow) {
            let tip = page.locator('.tippy-box').first()
            await tip.waitFor({ state: 'visible', timeout: 10000 })
            return (await tip.locator('.tippy-content').textContent()).trim()
        }
        await page.waitForTimeout(1000) //負向觀察窗: tippy 之 delay 為 150ms, 1 秒內未出現即視為無提示框
        let n = await page.locator('.tippy-box').count()
        if (n === 0) {
            return null
        }
        return (await page.locator('.tippy-box').first().locator('.tippy-content').textContent()).trim()
    }


    //E2E-004 R03: -stateFS 欄游標停留出現完整文字提示(含 <、> 原字元); 非 -err/-stateFS 欄(depth)游標停留不出現提示
    it('R03 -stateFS游標停留有完整提示且非目標欄無提示', async function() {
        let ctx = await openPage({ rows: getRowsLiq() })
        try {
            let { page } = ctx

            //驗證建議1: -stateFS 欄游標停留出現完整文字提示
            await scrollToCol(page, KEY_STATE)
            let cell = page.locator(`.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="${KEY_STATE}"]`)
            let full = '非液化之土壤分類[CL]; depth[0.4]<waterLevelDesign[0.5]; PI[14]>7'
            assert.strictEqual((await cell.textContent()).trim(), full, '儲存格顯示原字元(不得出現 &lt; 實體字面)')
            assert.strictEqual(await hoverTip(page, cell, true), full, '提示框為完整文字且 <、> 為原字元')

            //逐欄界線: 其他欄(depthStart)之儲存格游標停留不得出現提示框(cell-tooltip 之 v-if 只對 -err/-stateFS 欄回傳內容)
            await scrollToCol(page, 'depthStart')
            let cell2 = page.locator('.ag-center-cols-container .ag-row[row-index="2"] .ag-cell[col-id="depthStart"]')
            assert.strictEqual(await hoverTip(page, cell2, false), null, '非目標欄不得有提示框')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-004b R03: -err 欄游標停留出現完整文字提示(選用 sptSeed 方法, 第 7 列之 CRR75 超出研究範疇而有 -err 訊息)
    it('R03 -err游標停留有完整提示', async function() {
        let rows = getRowsLiq()
        let methods = ['sptSeed']
        let exp = calcRows(rows, methods)[6]['sptSeed-err']
        assert.ok(/CRR75/.test(exp), `夾具須確實產生 -err 訊息: ${exp}`)
        let ctx = await openPage({ initRows: rows, initMethods: methods })
        try {
            let { page } = ctx
            await waitGridIdle(page, { minCells: 1, timeout: 30000 })
            await scrollToCol(page, 'sptSeed-err')
            let cell = page.locator('.ag-center-cols-container .ag-row[row-index="6"] .ag-cell[col-id="sptSeed-err"]')
            assert.strictEqual((await cell.textContent()).trim(), exp, '儲存格顯示完整 -err 訊息')
            assert.strictEqual(await hoverTip(page, cell, true), exp, '提示框為完整 -err 訊息')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-005 R03/R04: 全表各欄各列之顯示文字與[修前顯示語意]逐格相同(轉數值不得改變顯示值)
    it('R03/R04 全欄顯示文字不變', async function() {
        let rows = getRowsLiqForColType()
        let ctx = await openPage({ rows })
        try {
            let { page } = ctx
            let exp = expectCellsFromCalc(rows)
            let act = await collectAllCells(page)
            let ks = Object.keys(exp)
            assert.ok(ks.length >= 60, `預期欄數應涵蓋基本欄與兩方法之計算欄, 實為 ${ks.length}`)
            let diffs = []
            ks.forEach((k) => {
                if (!act[k]) {
                    diffs.push(`${k}: 未渲染`)
                    return
                }
                exp[k].forEach((t, i) => {
                    if (act[k][i] !== t) {
                        diffs.push(`${k}[${i}]: 期望 ${JSON.stringify(t)} 實際 ${JSON.stringify(act[k][i])}`)
                    }
                })
            })
            assert.deepStrictEqual(diffs.slice(0, 20), [], `顯示文字不一致共 ${diffs.length} 格`)

            //尾零與文字原樣(無損): WC 有 kpDig 取位 17.0; Ml 無 kpDig 須維持 6.80; PI 之 NP 維持
            assert.strictEqual(act.WC[1], '17.0')
            assert.strictEqual(act.Ml[2], '6.80')
            assert.strictEqual(act.Ml[0], '6.8')
            assert.strictEqual(act.PI[6], 'NP')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-006 R04: 輸入列之 depthStart 為文字 "9.5", 於過濾列輸入 9.5 得該列; 數值過濾為相等比較(輸入 5 只得 depthStart=5 之列, 非包含比對)
    it('R04 文字數值欄之數值過濾有效', async function() {
        let ctx = await openPage({ rows: getRowsLiqForColType() })
        try {
            let { page } = ctx
            assert.strictEqual(await rowCount(page), 8)

            //驗證建議2: 輸入 9.5 得該列(depthStart=9.5, depth=10.25)
            await typeIntoFloatingFilter(page, 'depthStart', '9.5')
            await waitRowCount(page, 1)
            let cells = await cellsByCol(page)
            assert.strictEqual(cells.depthStart[0], '9.500') //kpDig.depthStart=3
            assert.strictEqual(cells.depth[0], '10.250')

            //清除過濾復原全部列
            await typeIntoFloatingFilter(page, 'depthStart', '')
            await waitRowCount(page, 8)

            //輸入 5: 數值相等僅 depthStart=5 之列(文字包含比對會連 3.5、6.5 皆命中)
            await typeIntoFloatingFilter(page, 'depthStart', '5')
            await waitRowCount(page, 1)
            cells = await cellsByCol(page)
            assert.strictEqual(cells.depthStart[0], '5.000')
            await typeIntoFloatingFilter(page, 'depthStart', '')
            await waitRowCount(page, 8)

            //有 kpDig 之欄(WC)即使來源為尾零文字('17.0'), 顯示由 kpDig 決定而不變(17.0), 轉數值後以相等比較: 輸入 17.00 得該列(文字包含比對則得不到)
            await scrollToCol(page, 'WC')
            await typeIntoFloatingFilter(page, 'WC', '17.00')
            await waitRowCount(page, 1)
            cells = await cellsByCol(page)
            assert.strictEqual(cells.WC[0], '17.0')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-007 R04: 非數值之欄(土壤分類文字、含尾零而不可無損轉換之 Ml)之過濾為文字比對, 可用輸入找到列
    it('R04 文字欄與不可無損轉數值之欄以文字過濾', async function() {
        let rows = getRowsLiqForColType()
        let ctx = await openPage({ rows })
        try {
            let { page } = ctx

            //土壤分類 SP-SM 兩列, 輸入 SP 以文字包含比對得 2 列
            await scrollToCol(page, 'soilClassification')
            await typeIntoFloatingFilter(page, 'soilClassification', 'SP')
            await waitRowCount(page, 2)
            let cells = await cellsByCol(page)
            assert.deepStrictEqual(cells.soilClassification, ['SP-SM', 'SP-SM'])
            await typeIntoFloatingFilter(page, 'soilClassification', '')
            await waitRowCount(page, 8)

            //Ml 第2列為 6.80(不可無損轉數值, 維持文字), 輸入 6.80 以文字比對僅得該列
            await scrollToCol(page, 'Ml')
            await typeIntoFloatingFilter(page, 'Ml', '6.80')
            await waitRowCount(page, 1)
            cells = await cellsByCol(page)
            assert.strictEqual(cells.Ml[0], '6.80')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-008 R05: 輸入列之 PGA 為空, 元件不整區空白, 於元件內顯示錯誤訊息並發出 error 事件; 修正輸入後復原; 空列(尚無資料)不是錯誤
    it('R05 analysis拋例外時顯示錯誤訊息並發出error事件', async function() {
        let ctx = await openPage() //宿主頁以空列掛載
        try {
            let { page } = ctx

            //空列(使用端資料載入前之常態)不算錯誤: 無錯誤訊息、無 error 事件、無 console error
            await page.waitForTimeout(300)
            assert.strictEqual(await page.getByRole('alert').count(), 0, '空列不得顯示錯誤訊息')
            assert.deepStrictEqual(await page.evaluate(() => window.__errs), [], '空列不得發出 error 事件')

            //驗證建議3: PGA 為空 → 顯示錯誤訊息並發出 error 事件
            let bad = getRowsLiq().map((r) => ({ ...r, PGA: '' }))
            await setRows(ctx, bad, { waitTable: false })
            let alert = page.getByRole('alert')
            await alert.waitFor({ state: 'visible', timeout: 10000 })
            assert.ok((await alert.innerText()).includes(MSG_NO_PGA), `錯誤訊息應含計算端原因: ${await alert.innerText()}`)
            await pollUntil('error 事件', async () => (await page.evaluate(() => window.__errs.length)) === 1, { timeout: 10000, interval: 100 })
            let errs = await page.evaluate(() => window.__errs)
            assert.ok(errs[0].includes(MSG_NO_PGA), `error 事件之 err 應為計算端例外: ${errs[0]}`)
            assert.strictEqual(await rowCount(page), 0, '失敗時不得留舊結果之表格列')
            assert.strictEqual(await page.getByText('Parameters', { exact: true }).count(), 0, '失敗時不得顯示繪圖區')

            //修正輸入後復原: 錯誤訊息消失、表格與繪圖區回來、不再發 error 事件
            await setRows(ctx, getRowsLiq())
            await alert.waitFor({ state: 'detached', timeout: 10000 })
            assert.strictEqual(await rowCount(page), 8)
            assert.strictEqual(await page.getByText('Parameters', { exact: true }).count(), 1, '成功時顯示繪圖區(參數選擇)')
            assert.strictEqual(await page.evaluate(() => window.__errs.length), 1, '成功之分析不得再發 error 事件')

            //再次失敗(此時已有成功之表格與繪圖區): 再顯示、再發出, 且舊結果須清除(不留舊表格列與舊繪圖區)
            await setRows(ctx, bad, { waitTable: false })
            await alert.waitFor({ state: 'visible', timeout: 10000 })
            await pollUntil('第2次 error 事件', async () => (await page.evaluate(() => window.__errs.length)) === 2, { timeout: 10000, interval: 100 })
            assert.strictEqual(await rowCount(page), 0, '成功後再失敗, 不得留舊表格列')
            assert.strictEqual(await page.getByText('Parameters', { exact: true }).count(), 0, '成功後再失敗, 不得留舊繪圖區')

            //成功→空列(使用端清空資料): 無錯誤、無新 error 事件、表格與繪圖區清空
            await setRows(ctx, getRowsLiq())
            await alert.waitFor({ state: 'detached', timeout: 10000 })
            assert.strictEqual(await rowCount(page), 8)
            await setRows(ctx, [], { waitTable: false })
            await pollUntil('清空後表格無列', async () => (await rowCount(page)) === 0, { timeout: 10000, interval: 100 })
            assert.strictEqual(await page.getByRole('alert').count(), 0, '空列不得顯示錯誤訊息')
            assert.strictEqual(await page.getByText('Parameters', { exact: true }).count(), 0, '空列不得留舊繪圖區')
            assert.strictEqual(await page.evaluate(() => window.__errs.length), 2, '空列不得發 error 事件')

            //整程無 pageerror 與 console error
            let errLogs = ctx.pageErrors.concat(ctx.logs.filter((m) => m.type === 'error').map((m) => m.text))
            assert.deepStrictEqual(errLogs, [], 'pageerror 或 console error')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-008b R05: 首次即帶資料掛載(使用端資料已備好之情形): 錯誤資料只發出一次 error 事件(不得因初始化次序先以空方法分析而重複發出); 正常資料直接顯示
    it('R05 首次即帶錯誤資料掛載只發出一次error事件', async function() {
        let bad = getRowsLiq().map((r) => ({ ...r, PGA: '' }))
        let ctx = await openPage({ initRows: bad })
        try {
            let { page } = ctx
            let alert = page.getByRole('alert')
            await alert.waitFor({ state: 'visible', timeout: 10000 })
            await page.waitForTimeout(1000) //負向觀察窗: 待可能之重複分析與 nextTick 事件出齊
            assert.strictEqual((await page.evaluate(() => window.__errs)).length, 1, '同一份錯誤資料首次掛載只應發出一次 error')
            assert.ok((await alert.innerText()).includes(MSG_NO_PGA))
        }
        finally {
            await ctx.close()
        }
    })


    it('R05 首次即帶正常資料掛載直接顯示表格且無錯誤', async function() {
        let ctx = await openPage({ initRows: getRowsLiq() })
        try {
            let { page } = ctx
            await waitGridIdle(page, { minCells: 1, timeout: 30000 })
            assert.strictEqual(await rowCount(page), 8)
            assert.strictEqual(await page.getByRole('alert').count(), 0)
            assert.deepStrictEqual(await page.evaluate(() => window.__errs), [])
            let errLogs = ctx.pageErrors.concat(ctx.logs.filter((m) => m.type === 'error').map((m) => m.text))
            assert.deepStrictEqual(errLogs, [], 'pageerror 或 console error')
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-009a R04: 轉為數值之欄(來源為文字)點表頭排序依數值大小(11 在 2 之後); 守門用: w-aggrid-vue 之 auto 排序對數值字串本即為數值比較, 轉型不應改變排序語意(拿掉轉型此案仍綠, 不屬轉型敏感案)
    it('R04 轉數值之欄依數值大小排序', async function() {
        let ctx = await openPage({ rows: getRowsLiq() })
        try {
            let { page } = ctx

            //act: 真滑鼠點擊 depthEnd 表頭(升冪)
            await headerCell(page, 'depthEnd').click()
            let exp = ['0.800', '2.000', '3.500', '5.000', '6.500', '8.400', '9.500', '11.000']
            await pollUntil('depthEnd 升冪', async () => JSON.stringify((await cellsByCol(page)).depthEnd) === JSON.stringify(exp), { timeout: 10000, interval: 100 })
            //降冪
            await headerCell(page, 'depthEnd').click()
            await pollUntil('depthEnd 降冪', async () => JSON.stringify((await cellsByCol(page)).depthEnd) === JSON.stringify(exp.slice().reverse()), { timeout: 10000, interval: 100 })
        }
        finally {
            await ctx.close()
        }
    })


    //E2E-009 R04: 匯出值之語意不變: 表格下載之 xlsx 中, 計算結果為數值者原值, 文字者若該欄被轉為數值則匯出為數值且與原文字數值相等, 否則逐字相同(-err/-stateFS 欄維持既有之 HTML 實體字面)
    it('R04 下載匯出值之語意不變', async function() {
        let rows = getRowsLiqForColType()
        let ctx = await openPage({ rows })
        try {
            let { page } = ctx

            //act: 真滑鼠點擊表格上方之下載鈕(圖示 mdiDownload)
            let box = await page.locator(`svg:has(path[d="${mdiDownload}"])`).first().boundingBox()
            let dlP = page.waitForEvent('download', { timeout: 15000 })
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
            let dl = await dlP
            let fp = tmp.file('export.xlsx')
            await dl.saveAs(fp)
            let d = await getDataFromExcelFileU8Arr(new Uint8Array(fs.readFileSync(fp)), { fmt: 'array', valueToString: false })
            fs.rmSync(fp, { force: true })
            let mat = d[0].data
            let hdr = mat[0]
            let exp = calcRows(rows)
            assert.strictEqual(mat.length - 1, exp.length, '匯出列數')
            let diffs = []
            let nNum = 0
            hdr.forEach((k, j) => {
                exp.forEach((r, i) => {
                    let v = r[k]
                    let e = mat[i + 1][j]
                    e = e === null || e === undefined ? '' : e
                    let ok
                    if (typeof v === 'number') {
                        ok = e === v
                    }
                    else if (typeof e === 'number') {
                        ok = isnum(v) && Number(v) === e
                        nNum++
                    }
                    else {
                        let ev = (k.indexOf('-err') >= 0 || k.indexOf('-stateFS') >= 0) ? String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;') : v
                        ok = e === ev
                    }
                    if (!ok) {
                        diffs.push(`${k}[${i}]: 計算值 ${JSON.stringify(v)} 匯出 ${JSON.stringify(e)}`)
                    }
                })
            })
            assert.deepStrictEqual(diffs.slice(0, 20), [], `匯出值不一致共 ${diffs.length} 格`)

            //被轉為數值之欄(depthStart)匯出為數值; 不可無損轉換之欄(Ml 含 6.80)維持文字
            let col = (k) => mat.slice(1).map((r) => r[hdr.indexOf(k)])
            assert.deepStrictEqual(col('depthStart'), [0, 0.8, 2, 3.5, 5, 6.5, 8.4, 9.5])
            assert.deepStrictEqual(col('Ml'), ['6.8', '6.8', '6.80', '6.8', '6.8', '6.8', '6.8', '6.8'])
            assert.ok(nNum > 0, '應至少有一欄被轉為數值匯出')
        }
        finally {
            await ctx.close()
        }
    })

})
