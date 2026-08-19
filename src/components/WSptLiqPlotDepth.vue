<template>
    <div
        style="display:inline-block;"
        v-if="hasOpt"
    >

        <div :style="`width:${getWidth(opt)}px; max-width:${getWidth(opt)}px; overflow-x:auto;`">
            <slot
                name="top"
                :opt="opt"
            ></slot>
        </div>

        <WPlot2d
            :options="opt"
        ></WPlot2d>

        <div :style="`width:${getWidth(opt)}px; max-width:${getWidth(opt)}px; overflow-x:auto;`">
            <slot
                name="bottom"
                :opt="opt"
            ></slot>
        </div>

    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
// import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import WPlot2d from './WPlot2d.vue'
import spc2html from '../js/spc2html.mjs'
import getDefOpt from '../js/getDefOpt.mjs'
import getDefChart from '../js/getDefChart.mjs'
import getDefAxis from '../js/getDefAxis.mjs'
import getDefLegend from '../js/getDefLegend.mjs'
import setLegendLoc from '../js/setLegendLoc.mjs'


function genLine(name, data, plotType) {

    //useLine
    let useLine = plotType.indexOf('line') >= 0

    //useMarker
    let useMarker = plotType.indexOf('marker') >= 0

    let type = 'line' //default
    if (useLine) {
        type = 'line'
    }
    if (plotType === 'marker') {
        type = 'scatter'
    }

    //ds
    let d = {
        type,
        name: spc2html(name),
        data,
        color: '#69f',
        lineWidth: useLine ? 1 : 0,
        marker: {
            enabled: useMarker,
        },
    }

    return d
}


function genHc(width, height, ytitle, xtitle, xmin, xmax, ds, optionsPic = {}) {

    //dopt
    let dopt = getDefOpt(optionsPic)

    //dct
    let dct = getDefChart(optionsPic)

    //marginLeft
    let marginLeft = get(dct, 'marginLeft', 0)

    //auto marginLeft
    if (!isestr(xtitle)) {
        let ml = 6 //至少要給1px以上, 否則框線會無法繪製
        dct.marginLeft = ml
        let dw = marginLeft - ml
        width -= dw
    }

    //dax
    let dax = getDefAxis({ vDig: 1 }) //深度預設取小數點1位
    dax.title.text = spc2html(xtitle)
    dax.min = xmin
    dax.max = xmax
    if (!isestr(xtitle)) {
        dax.labels.formatter = function () {
            return ''
        }
    }
    dax.opposite = false
    // console.log('dax', dax)

    //day
    let day = getDefAxis(optionsPic)
    day.title.text = spc2html(ytitle)
    day.min = 0 //從0開始
    day.opposite = false
    // console.log('day', day)

    //dlg
    let dlg = getDefLegend(optionsPic)

    //opt
    let opt = {
        ...dopt,

        chart: {
            ...dct,
            inverted: true, //xy交換
            width,
            height,
        },

        xAxis: dax,

        yAxis: day,

        legend: dlg,

        series: ds,

    }

    return opt
}


function addLineFs(opt) {

    //添加FS=1的線
    opt.series.push({
        type: 'line',
        name: 'FS=1',
        data: [[opt.xAxis.min, 1], [opt.xAxis.max, 1]],
        color: '#f26',
        lineWidth: 1,
        marker: {
            enabled: false,
        },
        dashStyle: 'LongDash',
    })
    // opt.yAxis.plotLines = [
    //     {
    //         color: '#f26',
    //         width: 1,
    //         value: 1,
    //         dashStyle: 'LongDash',
    //         zIndex: 1,
    //     },
    // ]

    //FS上下限
    opt.yAxis.min = 0
    opt.yAxis.max = 3

    return opt
}


function genOpt(st = {}, optionsPic = {}) {

    //params
    let { item, width, height, valueTitle, depthTitle, depthMin, depthMax, plotType } = st
    // console.log('st', st)

    //oneLine
    let oneLine = true
    if (true) {
        let r = get(item, 'data.0')
        if (iseobj(r)) {
            oneLine = false
        }
    }
    // console.log('oneLine', oneLine)

    //name
    let name = get(item, 'name', '')

    //ds
    let ds
    if (oneLine) {
        let lineName = name
        let lineData = get(item, 'data', [])
        let o = genLine(lineName, lineData, plotType)
        ds = [o]
    }
    else {
        ds = map(get(item, 'data', []), (v) => {
            let lineName = get(v, 'name', '')
            let lineData = get(v, 'data', [])
            let o = genLine(lineName, lineData, plotType)
            o.color = null //多線時自動刪除指定顏色, 由highcharts自動決定各線顏色
            return o
        })
    }
    // console.log('ds', ds)

    //opt
    let opt = genHc(width, height, valueTitle, depthTitle, depthMin, depthMax, ds, optionsPic)
    // console.log('opt', opt)

    //addLineFs
    if (name.indexOf('-FS') >= 0 || name.indexOf('-cmpFS') >= 0) {
        opt = addLineFs(opt, ds)
        // console.log('opt', opt)
    }

    //setLegendLoc
    opt = setLegendLoc(opt, optionsPic)

    // //merge
    // opt = merge(opt, optionsPic)
    // // console.log('opt', opt)

    return opt
}


/**
 * 繪製單一參數之深度剖線圖，深度為縱軸(由上而下)、參數值為橫軸，當參數名稱含有'-FS'或'-cmpFS'時，會自動添加FS=1之基準線並將值軸範圍鎖定為0至3
 *
 * 具名插槽(slot)：'top'為繪圖上方區塊、'bottom'為繪圖下方區塊，各插槽皆提供作用域參數opt，代表該圖之Highcharts設定物件
 *
 * @vue-prop {Object} [st={}] 輸入單一繪圖狀態物件，可由getSts產生，預設{}
 * @vue-prop {String} [st.key] 輸入繪圖識別key字串，預設無
 * @vue-prop {String} [st.valueTitle] 輸入參數值軸標題字串，可使用底線與上下標語法，預設無
 * @vue-prop {String} [st.depthTitle] 輸入深度軸標題字串，給予空字串時會自動隱藏深度軸標題與刻度文字並縮減左側邊界，預設無
 * @vue-prop {Number} [st.depthMin] 輸入深度軸最小值數字，預設無
 * @vue-prop {Number} [st.depthMax] 輸入深度軸最大值數字，預設無
 * @vue-prop {Number} [st.width] 輸入繪圖寬度數字，單位px，預設無
 * @vue-prop {Number} [st.height] 輸入繪圖高度數字，單位px，預設無
 * @vue-prop {String} [st.plotType='line+marker'] 輸入繪圖型態字串，可選'line+marker'、'line'、'marker'，預設'line+marker'
 * @vue-prop {Object} [st.item] 輸入繪圖數據物件，預設無
 * @vue-prop {String} [st.item.name] 輸入線名稱字串，預設無
 * @vue-prop {Array} [st.item.data] 輸入繪圖數據陣列，單線時給予[[深度,參數值],...]，多線時給予[{name,data},...]，參數值非數字時需給予null以跳過繪點，預設無
 * @vue-prop {Object} [optionsPic={}] 輸入繪圖設定物件，預設{}
 * @vue-prop {Boolean} [optionsPic.useTooltip=true] 輸入是否顯示提示框布林值，預設true
 * @vue-prop {String} [optionsPic.plotBorderColor='#666'] 輸入繪圖框線顏色字串，預設'#666'
 * @vue-prop {Number} [optionsPic.softMax] 輸入參數值軸軟性最大值數字，預設無
 * @vue-prop {Number} [optionsPic.vDig] 輸入參數值軸刻度文字取用小數點位數數字，預設無
 * @vue-prop {String} [optionsPic.titleFontFamily='微軟正黑體'] 輸入軸標題字型字串，預設'微軟正黑體'
 * @vue-prop {String} [optionsPic.titleFontSize='12pt'] 輸入軸標題字體大小字串，預設'12pt'
 * @vue-prop {String} [optionsPic.titleColor='#000000'] 輸入軸標題顏色字串，預設'#000000'
 * @vue-prop {String} [optionsPic.labelFontFamily='微軟正黑體'] 輸入軸刻度文字字型字串，預設'微軟正黑體'
 * @vue-prop {String} [optionsPic.labelFontSize='9pt'] 輸入軸刻度文字字體大小字串，預設'9pt'
 * @vue-prop {String} [optionsPic.labelColor='#222'] 輸入軸刻度文字顏色字串，預設'#222'
 * @vue-prop {String} [optionsPic.legnedFontFamily='微軟正黑體'] 輸入圖例字型字串，預設'微軟正黑體'
 * @vue-prop {String} [optionsPic.legnedFontSize='9pt'] 輸入圖例字體大小字串，預設'9pt'
 * @vue-prop {String} [optionsPic.legnedColor='#222'] 輸入圖例文字顏色字串，預設'#222'
 * @vue-prop {String} [optionsPic.legendBackgroundColor='rgba(255,255,255,0.75)'] 輸入圖例背景顏色字串，預設'rgba(255,255,255,0.75)'
 * @vue-prop {String} [optionsPic.legnedBorderColor='#aaa'] 輸入圖例框線顏色字串，預設'#aaa'
 * @vue-prop {String} [optionsPic.legendPosition='bottomleft'] 輸入圖例位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomleft'
 * @vue-computed {Boolean} hasOpt 回傳是否已產生有效Highcharts設定物件布林值
 * @vue-computed {Object} opt 回傳供繪圖使用之Highcharts設定物件
 */
export default {
    components: {
        WPlot2d,
    },
    props: {
        st: {
            type: Object,
            default: () => {},
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {
        }
    },
    computed: {

        hasOpt: function() {
            //console.log('computed hasOpt')

            let vo = this

            let b = iseobj(vo.opt)

            return b
        },

        opt: function() {
            //console.log('computed opt')

            let vo = this

            let r = null
            try {
                // console.log('vo.optionsPic', cloneDeep(vo.optionsPic))
                r = genOpt(vo.st, vo.optionsPic)
            }
            catch (err) {
                console.log(err)
            }

            return r
        },

    },
    methods: {

        getWidth: function(opt) {
            let w = get(opt, 'chart.width', null)
            if (!isnum(w)) {
                w = 400
            }
            w = cdbl(w)
            return w
        },

    }
}
</script>

<style scoped>
</style>
