import isnum from 'wsemi/src/isnum.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import isnull from 'wsemi/src/isnull.mjs'
import isundefined from 'wsemi/src/isundefined.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import dig from 'wsemi/src/dig.mjs'


/**
 * 取得表格儲存格之顯示文字
 *
 * 給予idig(kpDig內該欄位之小數位數)且值為數字(含數字字串)時取位，其餘空值為空字串、字串與數字原樣轉字串、物件與陣列轉JSON字串(含循環參照時為空字串)，
 * 轉換規則同w-aggrid-vue預設儲存格顯示，使儲存格slot與數值欄轉型前後之顯示比對共用同一份定義
 *
 * @param {*} v 輸入儲存格值
 * @param {Integer} [idig] 輸入小數位數，未給或undefined代表不取位
 * @returns {String} 回傳顯示文字字串
 */
function getCellText(v, idig) {

    //dig
    if (idig !== undefined && isnum(v)) {
        return dig(v, idig)
    }

    //check
    if (isnull(v) || isundefined(v)) {
        return ''
    }
    if (isstr(v) || isnum(v)) {
        return cstr(v)
    }

    //物件與陣列
    try {
        return JSON.stringify(v)
    }
    catch (err) {
        return ''
    }

}


export default getCellText
