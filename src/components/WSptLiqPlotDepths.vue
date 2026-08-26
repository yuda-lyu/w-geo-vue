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
            <WSoilColumn
                :items="geocolItems"
                :width="stGl.width"
                :height="stGl.height"
                :paddingStyle="paddingStyleGeolayer"
                :tickSize="30"
                :segmentSize="25"
                :keyDepthStart="geocolKeyValueStart"
                :keyDepthEnd="geocolKeyValueEnd"
                :keyText="geocolKeyText"
                :keyLegendCode="geocolKeyLegendCode"
                :mergeSameLayers="geocolMergeSameLayers"
                :title="stGl.depthTitle"
                :optionsSegments="{textShift:80}"
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
            </WSoilColumn>

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
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import WSoilColumn from './WSoilColumn.vue'
import WSptLiqPlotDepth from './WSptLiqPlotDepth.vue'
import getDefChart from '../js/getDefChart.mjs'


/**
 * 並排繪製多個參數之深度剖線圖，當sts第1筆之key為'Geolayer'時，會於最左側改以土柱圖繪製地層並標註地下水位，其餘參數則各自呼叫WSptLiqPlotDepth繪圖，且僅最左側參數圖保留深度軸標題與刻度文字
 *
 * 具名插槽(slot)：'zone-top-geolayer'與'zone-bottom-geolayer'為土柱圖之上下方區塊，提供作用域參數width與height；'zone-top-pic'與'zone-bottom-pic'為各參數圖之上下方區塊，提供作用域參數width、height與st，各區塊高度由optionsPic之zoneTopHeight與zoneBottomHeight控制
 *
 * 土柱圖由WSoilColumn繪製，土壤圖示為套件內建不依賴網路載入
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
 * @vue-computed {Object} paddingStyleGeolayer 回傳土柱圖之內距物件，供上下對齊Highcharts繪圖區
 * @vue-computed {Object} stGl 回傳土柱圖之繪圖狀態物件，若sts第1筆非土柱圖則回傳null
 * @vue-computed {Boolean} hasGeolayer 回傳是否繪製土柱圖布林值
 * @vue-computed {Number} waterLevel 回傳地下水位深度數字，單位m
 * @vue-computed {Array} stOthers 回傳土柱圖以外之各參數繪圖狀態物件陣列，且非最左側者自動清除深度軸標題
 * @vue-computed {Number} zoneTopHeight 回傳繪圖上方插槽區塊高度數字
 * @vue-computed {Number} zoneBottomHeight 回傳繪圖下方插槽區塊高度數字
 * @vue-computed {Array} geocolItems 回傳供土柱圖繪製之各土層數據陣列，相鄰同層合併由WSoilColumn依geocolMergeSameLayers處理
 * @vue-computed {Number} spaceGeolayer 回傳土柱圖與參數圖之間距數字
 * @vue-computed {Number} spacePlot 回傳各參數圖之間距數字
 */
export default {
    components: {
        WSoilColumn,
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

        }
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

        hasGeolayer: function() {
            let vo = this
            let b = iseobj(vo.stGl)
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
