<template>
    <div :style="`display:flex;`">

        <div
            :style="`padding-right:${stOthers.length>0?spaceGeolayer:0}px;`"
            v-if="hasGeolayer"
        >

            <div :style="`width:${stGl.width}px; height:${zoneTopHeight}px; overflow:auto;`">
                <slot
                    name="zone-top-geolayer"
                    :width="stGl.width"
                    :height="zoneTopHeight"
                ></slot>
            </div>

            <!-- paddingStyle須配合getDefChart的margin值 -->
            <WSegmentsVertical
                :items="geocolItems"
                :width="stGl.width"
                :height="stGl.height"
                :paddingStyle="paddingStyleGeolayer"
                :tickSize="30"
                :segmentSize="25"
                :segmentBackgroundType="'image'"
                :funSegmentBackgroundImage="getSegmentBackgroundIcon"
                :segmentBorderColor="{v:'transparent',h:'#444'}"
                :axisColor="'transparent'"
                :tickColor="'#444'"
                :keyValueStart="geocolKeyValueStart"
                :keyValueEnd="geocolKeyValueEnd"
                :keyText="geocolKeyText"
                :alignEnd="'left'"
                :textShift="80"
                :title="stGl.depthTitle"
                :funFormatTickValue="getTickValue"
            >
                <template v-slot:support-right="props">
                    <div :style="`padding-top:${props.convertValueToY(waterLevel)}px;`">

                        <!-- anchor line, 圖標與數值寬度38px -->
                        <div style="_width:38px; _border-top:1px solid #f26;">

                            <!-- wl vertical center line, 圖標與數值垂直中線距左側19px -->
                            <div style="padding-left:19px;">

                                <div style="position:relative;">

                                    <!-- water level text -->
                                    <div style="position:absolute; top:-30px; left:1px; transform:translateX(-50%);">
                                        <div style="white-space:nowrap; transform-origin:center; transform:scale(0.6);">
                                            {{waterLevel}}m
                                        </div>
                                    </div>

                                    <!-- water level icon -->
                                    <div style="position:absolute; top:-15px; left:0px; transform:translateX(-50%);">
                                        <svg width="14" height="12" viewBox="0 0 14 12">
                                            <polygon points="2,0 12,0 7,9" style="fill:rgba(0,0,0,0);stroke:#000;stroke-width:1" />
                                            <line x1="0" y1="9" x2="14" y2="9" style="stroke:#000;stroke-width:1" />
                                            <line x1="4" y1="11" x2="11" y2="11" style="stroke:#000;stroke-width:1" />
                                        </svg>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                </template>
            </WSegmentsVertical>

            <div :style="`width:${stGl.width}px; height:${zoneBottomHeight}px; overflow:auto;`">
                <slot
                    name="zone-bottom-geolayer"
                    :width="stGl.width"
                    :height="zoneBottomHeight"
                ></slot>
            </div>

        </div>

        <div>

            <div style="display:flex; align-items:flex-start;">

                <div
                    :style="`padding-left:${kst>0?spacePlot:0}px;`"
                    :key="'kst-'+kst"
                    v-for="(st,kst) in stOthers"
                >

                    <WSptLiqPlotDepth
                        :st="st"
                        :optionsPic="optionsPic"
                    >

                        <template v-slot:top="props">
                            <div :style="`padding-left:${kst===0?dw:0}px; width:${getWidth(props.opt)-(kst===0?dw:0)}px; height:${zoneTopHeight}px; overflow:auto;`">
                                <slot
                                    name="zone-top-pic"
                                    :width="getWidth(props.opt)"
                                    :height="zoneTopHeight"
                                    :st="st"
                                ></slot>
                            </div>
                        </template>

                        <template v-slot:bottom="props">
                            <div :style="`width:${getWidth(props.opt)}px; height:${zoneBottomHeight}px; overflow:auto;`">
                                <slot
                                    name="zone-bottom-pic"
                                    :width="getWidth(props.opt)"
                                    :height="zoneBottomHeight"
                                    :st="st"
                                ></slot>
                            </div>
                        </template>

                    </WSptLiqPlotDepth>
                </div>

            </div>

        </div>

    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import trim from 'lodash-es/trim.js'
import filter from 'lodash-es/filter.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import dig from 'wsemi/src/dig.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import importResources from 'wsemi/src/importResources.mjs'
import WSegmentsVertical from 'w-component-vue/src/components/WSegmentsVertical.vue'
import WSptLiqPlotDepth from './WSptLiqPlotDepth.vue'
import getDefChart from '../js/getDefChart.mjs'


/**
 * 並排繪製多個參數之深度剖線圖，當sts第1筆之key為'Geolayer'時，會於最左側改以土柱圖繪製地層並標註地下水位，其餘參數則各自呼叫WSptLiqPlotDepth繪圖，且僅最左側參數圖保留深度軸標題與刻度文字
 *
 * 具名插槽(slot)：'zone-top-geolayer'與'zone-bottom-geolayer'為土柱圖之上下方區塊，提供作用域參數width與height；'zone-top-pic'與'zone-bottom-pic'為各參數圖之上下方區塊，提供作用域參數width、height與st，各區塊高度由optionsPic之zoneTopHeight與zoneBottomHeight控制
 *
 * 土柱圖示需由網路載入w-demores之dataCivilSoilCodeIcon，未載入完成前不繪製土柱圖
 *
 * @vue-prop {Array} [sts=[]] 輸入多個繪圖狀態物件陣列，可由getSts產生，各物件格式同WSptLiqPlotDepth之st，其中key為'Geolayer'者代表土柱圖，預設[]
 * @vue-prop {Object} [optionsPic={}] 輸入繪圖設定物件，除下列鍵值外，其餘鍵值同WSptLiqPlotDepth之optionsPic並向下傳遞，預設{}
 * @vue-prop {Number} [optionsPic.zoneTopHeight=0] 輸入繪圖上方插槽區塊高度數字，單位px，預設0
 * @vue-prop {Number} [optionsPic.zoneBottomHeight=0] 輸入繪圖下方插槽區塊高度數字，單位px，預設0
 * @vue-prop {Number} [optionsPic.spaceGeolayer=10] 輸入土柱圖與參數圖之間距數字，單位px，預設10
 * @vue-prop {Number} [optionsPic.spacePlot=0] 輸入各參數圖之間距數字，單位px，預設0
 * @vue-prop {String} [optionsPic.geocolKeyValueStart='depthStart'] 輸入土柱圖各層起始深度之欄位key字串，預設'depthStart'
 * @vue-prop {String} [optionsPic.geocolKeyValueEnd='depthEnd'] 輸入土柱圖各層結束深度之欄位key字串，預設'depthEnd'
 * @vue-prop {String} [optionsPic.geocolKeyText='description'] 輸入土柱圖各層說明文字之欄位key字串，預設'description'
 * @vue-prop {String} [optionsPic.geocolKeyLegendCode='legendCode'] 輸入土柱圖各層土壤圖例代碼之欄位key字串，供對應土壤圖示，預設'legendCode'
 * @vue-prop {Boolean} [optionsPic.geocolMergeSameLayers=false] 輸入土柱圖是否合併相鄰且圖例代碼與說明文字皆相同土層布林值，預設false
 * @vue-data {Number} dw 儲存最左側參數圖之插槽區塊左移距離數字，單位px，供插槽內容能對齊至繪圖框
 * @vue-data {Object} kpGlIcon 儲存土壤圖例代碼對應土壤圖示物件
 * @vue-computed {Object} paddingStyleGeolayer 回傳土柱圖之內距物件，供上下對齊Highcharts繪圖區
 * @vue-computed {Object} stGl 回傳土柱圖之繪圖狀態物件，若sts第1筆非土柱圖則回傳null
 * @vue-computed {Boolean} hasKpGlIcon 回傳是否已載入土壤圖示布林值
 * @vue-computed {Boolean} hasGeolayer 回傳是否繪製土柱圖布林值
 * @vue-computed {Number} waterLevel 回傳地下水位深度數字，單位m
 * @vue-computed {Array} stOthers 回傳土柱圖以外之各參數繪圖狀態物件陣列，且非最左側者自動清除深度軸標題
 * @vue-computed {Number} zoneTopHeight 回傳繪圖上方插槽區塊高度數字
 * @vue-computed {Number} zoneBottomHeight 回傳繪圖下方插槽區塊高度數字
 * @vue-computed {Array} geocolItems 回傳供土柱圖繪製之各土層數據陣列
 * @vue-computed {Number} spaceGeolayer 回傳土柱圖與參數圖之間距數字
 * @vue-computed {Number} spacePlot 回傳各參數圖之間距數字
 */
export default {
    components: {
        WSegmentsVertical,
        WSptLiqPlotDepth,
    },
    props: {
        sts: {
            type: Array,
            default: () => [],
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {

            //若位於最左側有開啟depth軸, slot區向平移使能對齊至圖框, 移動距離為highcharts設定marginLeft-保留間距ml/2
            //marginLeft(60) - ml/2(3)
            dw: 60 - 3,

            kpGlIcon: {},

        }
    },
    mounted: function() {
        let vo = this

        importResources('https://cdn.jsdelivr.net/npm/w-demores/res/data/dataCivilSoilCodeIcon.js')
            .then((res) => {
                // console.log(res)
                // console.log('window.dataCivilSoilCodeIcon', window.dataCivilSoilCodeIcon)
                vo.kpGlIcon = window.dataCivilSoilCodeIcon
            })

    },
    computed: {

        paddingStyleGeolayer: function() {

            //dct, 上下須取用getDefChart之margin值, 土柱圖繪圖區才能與highcharts繪圖區上下對齊
            let dct = getDefChart()

            return {
                top: get(dct, 'marginTop', 0),
                right: 0,
                bottom: get(dct, 'marginBottom', 0),
                left: 85, //左側為土柱圖自身深度軸之標題與刻度文字空間, 與highcharts無關
            }
        },

        stGl: function() {
            //console.log('computed stGl')

            let vo = this

            let stGl = get(vo, `sts.0`, {})
            // console.log('stGl', stGl)

            let key = get(stGl, 'key', '')

            if (key === 'Geolayer') {
                return stGl
            }
            return null
        },

        hasKpGlIcon: function() {
            let vo = this
            let b = iseobj(vo.kpGlIcon)
            return b
        },

        hasGeolayer: function() {
            let vo = this
            let b1 = iseobj(vo.stGl)
            let b2 = vo.hasKpGlIcon
            let b = b1 && b2
            return b
        },

        waterLevel: function() {
            //console.log('computed waterLevel')

            let vo = this

            let wl = get(vo, 'stGl.waterLevel', 0)
            // console.log('waterLevel', wl)

            return wl
        },

        stOthers: function() {
            //console.log('computed stOthers')

            let vo = this

            let stOthers = filter(vo.sts, (v) => {
                let key = get(v, 'key', '')
                return key !== 'Geolayer'
            })
            // console.log('stOthers', stOthers)

            stOthers = map(stOthers, (v, k) => {
                let depthTitle = v.depthTitle
                if (k > 0) {
                    depthTitle = '' //非最左側參數圖自動清除軸標題
                }
                return {
                    ...v,
                    depthTitle,
                }
            })
            // console.log('stOthers(自動清除軸標題)', stOthers)

            return stOthers
        },

        zoneTopHeight: function() {
            let vo = this
            let h = get(vo, 'optionsPic.zoneTopHeight', 0)
            // console.log('zoneTopHeight', h)
            return h
        },

        zoneBottomHeight: function() {
            let vo = this
            let h = get(vo, 'optionsPic.zoneBottomHeight', 0)
            // console.log('zoneBottomHeight', h)
            return h
        },

        geocolKeyValueStart: function() {
            let vo = this
            let r = get(vo, 'optionsPic.geocolKeyValueStart', 'depthStart')
            return r
        },

        geocolKeyValueEnd: function() {
            let vo = this
            let r = get(vo, 'optionsPic.geocolKeyValueEnd', 'depthEnd')
            return r
        },

        geocolKeyText: function() {
            let vo = this
            let r = get(vo, 'optionsPic.geocolKeyText', 'description')
            return r
        },

        geocolKeyLegendCode: function() {
            let vo = this
            let r = get(vo, 'optionsPic.geocolKeyLegendCode', 'legendCode')
            return r
        },

        geocolMergeSameLayers: function() {
            let vo = this
            let r = get(vo, 'optionsPic.geocolMergeSameLayers', false)
            return r
        },

        geocolItems: function() {
            let vo = this
            let items = get(vo, 'stGl.item.data', [])
            if (vo.geocolMergeSameLayers) {
                items = vo.mergeSameLegendCodeAndText(items)
            }
            return items
        },

        spaceGeolayer: function() {
            let vo = this
            let r = get(vo, 'optionsPic.spaceGeolayer', null)
            if (!isnum(r)) {
                r = 10 //預設10px
            }
            r = cdbl(r)
            // console.log('spaceGeolayer', r)
            return r
        },

        spacePlot: function() {
            let vo = this
            let r = get(vo, 'optionsPic.spacePlot', null)
            if (!isnum(r)) {
                r = 0
            }
            r = cdbl(r)
            // console.log('spacePlot', r)
            return r
        },

    },
    methods: {

        getSegmentBackgroundIcon: function(item) {
            // console.log('getSegmentBackgroundIcon', item)
            let vo = this
            let legendCode = get(item, vo.geocolKeyLegendCode, '')
            // console.log('legendCode', legendCode)
            let bgicon = get(vo.kpGlIcon, legendCode, '')
            // console.log('bgicon', bgicon)
            return bgicon
        },

        getTickValue: function(v) {
            return dig(v, 1)
        },

        getWidth: function(opt) {
            let w = get(opt, 'chart.width', null)
            if (!isnum(w)) {
                w = 400
            }
            w = cdbl(w)
            return w
        },

        mergeSameLegendCodeAndText: function(items) {
            let vo = this
            let itemsTemp = cloneDeep(items)
            each(itemsTemp, (_v, k) => {
                if (k === 0) {
                    return true //跳出換下一個
                }
                let k0 = k - 1
                let k1 = k
                let v0 = get(itemsTemp, k0, {})
                let v1 = get(itemsTemp, k1, {})
                let b1 = v0[vo.geocolKeyLegendCode] === v1[vo.geocolKeyLegendCode]
                let b2 = trim(v0[vo.geocolKeyText]) === trim(v1[vo.geocolKeyText]) //土壤描述也要相同才合併
                let b = b1 && b2
                if (b) {
                    itemsTemp[k1][vo.geocolKeyValueStart] = v0[vo.geocolKeyValueStart] //使用前一層depthStart
                    itemsTemp[k0] = null
                }
            })
            itemsTemp = filter(itemsTemp, iseobj)
            return itemsTemp
        },

    }
}
</script>

<style scoped>
</style>
