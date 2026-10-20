import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import keys from 'lodash-es/keys.js'
import isestr from 'wsemi/src/isestr.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import calcLiquefaction from 'w-geo/src/calcLiquefaction.mjs'
import getSts from './getSts.mjs'
import cvNumCols from './cvNumCols.mjs'


function escapeHTML(c) {
    c = cstr(c)
    if (isestr(c)) {
        c = c
            // .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // .replace(/"/g, '&quot;')
            // .replace(/'/g, '&#39;')
    }
    return c
}


//isLongTextKey, -err與-stateFS為可能含<>符號之長文字訊息欄, 儲存格以html呈現故先escapeHTML, 且須開啟儲存格提示
function isLongTextKey(k) {
    return (
        k.indexOf('-err') >= 0 ||
        k.indexOf('-stateFS') >= 0 ||
        false
    )
}


function anaSptLiq(rowsIn, opt = {}) {

    //kpHead
    let kpHead = get(opt, 'kpHead', {})

    //kpDig
    let kpDig = get(opt, 'kpDig', {})

    //depthTitle
    let depthTitle = get(opt, 'depthTitle', 'Depth(m)')

    //geolayerWidth
    let geolayerWidth = get(opt, 'geolayerWidth', 240)

    //geolayerWaterLevel
    let geolayerWaterLevel = get(opt, 'geolayerWaterLevel', 0)

    //rowsOut
    let rowsOut = calcLiquefaction.calc('SPT', rowsIn, opt)
    // console.log('rowsOut', cloneDeep(rowsOut))

    //escapeHTML, 因-err與-stateFS會含有<>符號, ag-grid會無法正常顯示, 得先取代成html專用顯示符號
    rowsOut = map(rowsOut, (r) => {
        let rr = {}
        each(r, (v, k) => {
            if (isLongTextKey(k)) {
                v = escapeHTML(v)
            }
            rr[k] = v
        })
        return rr
    })
    // console.log('rowsOut(escapeHTML)', cloneDeep(rowsOut))

    //rowOut0
    let rowOut0 = get(rowsOut, 0, {})

    //ks
    let ks = keys(rowOut0)
    // console.log('ks', ks)

    //cvNumCols, 計算結果列中來源為文字之數值欄須轉為數值, 否則表格數值過濾器比對不到(顯示文字不變), 並逐欄給予過濾器型別
    //轉型後之列只給表格使用; 繪圖狀態(getSts, 其以isestr判斷legendCode等字串欄)與外部取得之分析結果列(rows)維持轉型前之原值, 避免改變既有繪圖與插槽之契約
    let nc = cvNumCols(rowsOut, kpDig)

    //optTable, 欄名/儲存格/提示之客製改由組件template內WTableEdit之slot(head-render, cell-render, cell-tooltip)實作, opt不得再給kpHeadRender等舊鍵
    let optTable = {}
    if (true) {
        optTable = {
            keys: ks,
            rows: nc.rows,
            defHeadSortMethod: 'auto',
            defCellEditable: false, //關閉編輯功能, 待日後開發
            //儲存格左右對齊維持依賴套件預設(置中): 原寫為拼錯之defCellAlighH:'left', 一向被忽略而實為置中, 為不改既有畫面(使用端之標準圖)故移除而不改正
            kpHead,
            kpHeadFilterType: nc.kpHeadFilterType,
        }
    }

    //sts
    let sts = getSts(rowsOut, kpHead, depthTitle, geolayerWidth, geolayerWaterLevel)
    // console.log('sts', sts)

    return {
        optTable,
        sts,
        rows: rowsOut,
    }
}


export { isLongTextKey }
export default anaSptLiq
