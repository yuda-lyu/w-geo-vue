import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'


function isSame(a, b) {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}


function isMatch(k, keyParamSelects) {
    for (let i = 0; i < keyParamSelects.length; i++) {
        let flt = keyParamSelects[i]
        if (isestr(flt.keyPart) && k.indexOf(flt.keyPart) >= 0) {
            return true
        }
        if (isestr(flt.keyFull) && k === flt.keyFull) {
            return true
        }
    }
    return false
}


/**
 * 依分析結果之參數鍵變化計算已勾選之繪圖參數鍵
 *
 * 首次出現(keysPrev為空)與日後新出現(例如新勾選液化分析方法而增加其-FS、-PL、-stlTS、-stlIY等參數)之參數鍵，符合keyParamSelects過濾設定者自動加入勾選；
 * 已消失(例如取消勾選液化分析方法)之參數鍵自勾選移除，再次出現時視為新出現而重新自動勾選；
 * 前後皆存在之參數鍵維持使用者之勾選結果，不因分析結果更新而改變；keysNow為空(尚無分析結果或分析失敗)時不變更
 *
 * 未變更時回傳之keyStsSelects與keysPrev為輸入之原陣列(同一參照)，供呼叫端以參照比較判斷是否需寫回
 *
 * @param {Array} keysNow 輸入目前分析結果各參數之key字串陣列
 * @param {Array} keysPrev 輸入前次處理時各參數之key字串陣列
 * @param {Array} keyStsSelects 輸入目前已勾選繪圖參數之key字串陣列
 * @param {Array} keyParamSelects 輸入預設勾選繪圖參數之過濾設定物件陣列，物件可給予keyFull(需完全相同)或keyPart(需部份含有)
 * @returns {Object} 回傳物件，keysPrev為更新後之參數key字串陣列，keyStsSelects為更新後之已勾選繪圖參數key字串陣列
 */
function getKeyStsSelects(keysNow, keysPrev, keyStsSelects, keyParamSelects) {

    //check
    if (!isearr(keysNow)) {
        return { keysPrev, keyStsSelects }
    }

    //kpNow, kpPrev
    let kpNow = {}
    keysNow.forEach((k) => {
        kpNow[k] = true
    })
    let kpPrev = {}
    keysPrev.forEach((k) => {
        kpPrev[k] = true
    })

    //keep, 已消失之參數鍵不再勾選
    let keep = keyStsSelects.filter((k) => kpNow[k] === true)

    //add, 新出現且符合預設勾選過濾設定之參數鍵
    let kpKeep = {}
    keep.forEach((k) => {
        kpKeep[k] = true
    })
    let add = []
    if (isearr(keyParamSelects)) {
        keysNow.forEach((k) => {
            if (kpPrev[k] !== true && kpKeep[k] !== true && isMatch(k, keyParamSelects)) {
                kpKeep[k] = true
                add.push(k)
            }
        })
    }

    //keyStsSelectsNew
    let keyStsSelectsNew = [...keep, ...add]

    return {
        keysPrev: isSame(keysNow, keysPrev) ? keysPrev : keysNow,
        keyStsSelects: isSame(keyStsSelectsNew, keyStsSelects) ? keyStsSelects : keyStsSelectsNew,
    }
}


export default getKeyStsSelects
