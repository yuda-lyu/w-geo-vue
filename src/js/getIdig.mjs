/**
 * 取得kpDig內某欄位之顯示小數位數
 *
 * 只取kpDig自有之鍵(不含constructor、toString等繼承成員)，無則回傳undefined代表不取位
 *
 * @param {Object} kpDig 輸入欄位鍵對應顯示小數位數之物件
 * @param {String} k 輸入欄位鍵
 * @returns {*} 回傳小數位數，無該鍵時為undefined
 */
function getIdig(kpDig, k) {
    if (kpDig !== null && typeof kpDig === 'object' && Object.prototype.hasOwnProperty.call(kpDig, k)) {
        return kpDig[k]
    }
    return undefined
}


export default getIdig
