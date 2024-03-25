import get from 'lodash-es/get.js'


/**
 * 產生預設Highcharts圖物件
 *
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @returns {Object} 回傳物件
 */
function getDefChart(opt = {}) {

    let plotBorderColor = get(opt, 'plotBorderColor', '#666')

    let sp = 5 //邊緣最少5px以上, 否則曲線圖標貼框時會被裁切

    let obj = {
        animation: false, //關閉動畫
        plotBorderColor,
        plotBorderWidth: 1,
        marginLeft: sp + 60,
        marginRight: sp,
        marginTop: sp + 20, //考慮土柱圖上方地下水位為0時之最小marginTop
        marginBottom: sp + 50,
        spacingLeft: 0,
        spacingRight: 0,
        spacingTop: 0,
        spacingBottom: 0,
    }

    return obj
}


export default getDefChart
