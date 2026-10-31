import isnum from 'wsemi/src/isnum.mjs'
import isenum from 'wsemi/src/isenum.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import isnull from 'wsemi/src/isnull.mjs'
import isundefined from 'wsemi/src/isundefined.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import dig from 'wsemi/src/dig.mjs'


/**
 * 取得表格儲存格之顯示文字
 *
 * 給予idig(kpDig內該欄位之小數位數)且值為有效數字(isenum：有限數字，或去頭尾空白後為十進位寫法之數字字串)時取位，
 * 其餘空值為空字串、字串與數字原樣轉字串、物件與陣列轉JSON字串(含循環參照時為空字串)，
 * 故十六進位字樣('0x10')、Infinity、溢位科學記號('1e400')等非有效數字不取位，照原樣當文字顯示(不為空字串)，
 * 轉換規則同w-aggrid-vue預設儲存格顯示，使儲存格slot與數值欄轉型前後之顯示比對共用同一份定義
 *
 * @param {*} v 輸入儲存格值
 * @param {Integer} [idig] 輸入小數位數，未給或undefined代表不取位
 * @returns {String} 回傳顯示文字字串
 */
function getCellText(v, idig) {

    //dig, 取位只對有效數字(wsemi 1.9.36起dig對非有效數字回傳空字串, 故須先以isenum判斷, 非有效數字落入下方原樣轉字串)
    if (idig !== undefined && isenum(v)) {
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
