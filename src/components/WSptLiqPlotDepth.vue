<template>
    <div
        style="display:inline-block;"
        v-if="hasOpt"
    >

        <div :style="`width:${getWidth}px; max-width:${getWidth}px;`">
            <slot
                name="top"
                :opt="opt"
            ></slot>
        </div>

        <WPlot2d
            :options="opt"
        ></WPlot2d>

        <div :style="`width:${getWidth}px; max-width:${getWidth}px;`">
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

    //FS上下限[0,2]
    opt.yAxis.min = 0
    opt.yAxis.max = 2

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
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
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

        getWidth: function() {
            let vo = this
            let w = get(vo, 'opt.chart.width', 0)
            return w
        },

    }
}
</script>

<style scoped>
</style>
