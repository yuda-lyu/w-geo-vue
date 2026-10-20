import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import every from 'lodash-es/every.js'
import size from 'lodash-es/size.js'
import keys from 'lodash-es/keys.js'
import isnum from 'wsemi/src/isnum.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import getCellText from './getCellText.mjs'
import getIdig from './getIdig.mjs'


function isBlank(v) {
    return v === null || v === undefined || v === ''
}


//isSafeNum, 數值字串之值須為有限且絕對值不超過安全整數上限, 否則轉數值會夾限(Infinity)或失去精度(極大整數)而改變數值
function isSafeNum(v) {
    let n = Number(v)
    return Number.isFinite(n) && Math.abs(n) <= Number.MAX_SAFE_INTEGER
}


/**
 * 將表格各列中以文字傳入之數值欄轉為數值，並依欄位型別給予過濾器型別
 *
 * 計算結果列之數值欄在來源列為文字時會原樣保留文字，表格預設之數值過濾器('num')比對文字值會得不到列。
 * 逐欄判型：①欄內非空值皆為數值或數值字串，且各值轉為數值前後之顯示文字(含kpDig取位)皆相同時，該欄文字值轉為數值並給予'num'過濾器；
 * ②其餘有非空值之欄維持原值並給予'text'過濾器(例如含NP、-之欄，或不取位而尾零會因轉數值消失之欄)；③全為空值之欄不指定(沿用表格預設之數值過濾器，因無資料故無實質影響)。
 * 顯示文字不變為硬約束，故轉換不會改變儲存格所見：有kpDig之欄因取位函數內部即先轉數值，轉換前後之顯示文字必然相同(檢查恆成立，保障來自取位本身)，
 * 無kpDig之欄才實際比對字面(尾零、前導零、前後空白、科學記號、正負號、十六進位字樣等字面不同者維持文字)；
 * 數值字串另須為有限值且絕對值不超過安全整數上限，否則(Infinity、1e309、超過2^53之整數)維持文字，避免轉換時夾限或失去精度
 *
 * @param {Array} rows 輸入列物件陣列，各列鍵同第1列
 * @param {Object} [kpDig={}] 輸入欄位鍵對應顯示小數位數之物件
 * @returns {Object} 回傳物件，含rows(新的列物件陣列，不改動輸入)與kpHeadFilterType(欄位鍵對應'num'或'text'之物件)
 */
function cvNumCols(rows, kpDig = {}) {

    //ks
    let ks = keys(get(rows, 0, {}))

    //colsNum, kpHeadFilterType
    let colsNum = new Set()
    let kpHeadFilterType = {}
    each(ks, (k) => {

        //idig
        let idig = getIdig(kpDig, k)

        //vs
        let vs = filter(map(rows, (r) => r[k]), (v) => !isBlank(v))
        if (size(vs) === 0) {
            return true
        }

        //b, 皆為數值且轉數值前後顯示文字相同
        let b = every(vs, (v) => {
            if (!isnum(v)) {
                return false
            }
            if (!isstr(v)) {
                return true
            }
            if (!isSafeNum(v)) {
                return false
            }
            return getCellText(cdbl(v), idig) === getCellText(v, idig)
        })

        //save
        if (b) {
            colsNum.add(k)
            kpHeadFilterType[k] = 'num'
        }
        else {
            kpHeadFilterType[k] = 'text'
        }

    })

    //rowsOut
    let rowsOut = map(rows, (r) => {
        let rr = {}
        each(r, (v, k) => {
            if (colsNum.has(k) && isstr(v) && !isBlank(v)) {
                v = cdbl(v)
            }
            rr[k] = v
        })
        return rr
    })

    return {
        rows: rowsOut,
        kpHeadFilterType,
    }
}


export default cvNumCols
