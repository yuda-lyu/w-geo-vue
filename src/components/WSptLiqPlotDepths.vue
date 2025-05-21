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
                :paddingStyle="{
                    top: 25,
                    right: 0,
                    bottom: 55,
                    left: 85,
                }"
                :tickSize="30"
                :segmentSize="50"
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


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
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

        importResources('https://cdn.jsdelivr.net/npm/w-demores@1.0.27/res/data/dataCivilSoilCodeIcon.js')
            .then((res) => {
                // console.log(res)
                // console.log('window.dataCivilSoilCodeIcon', window.dataCivilSoilCodeIcon)
                vo.kpGlIcon = window.dataCivilSoilCodeIcon
            })

    },
    computed: {

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
            let w = get(opt, 'chart.width', 0)
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
