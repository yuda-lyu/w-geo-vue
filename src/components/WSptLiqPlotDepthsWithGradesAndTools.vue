<template>
    <div
        :style="``"
        :changeGroupParams="changeGroupParams"
        :changeKeyStsSelects="changeKeyStsSelects"
    >

        <div :style="``">

            <div style="padding-bottom:20px;">
                <div style="padding:0px 6px 3px 4px; display:inline-block; border-bottom:1px solid #999;">
                    <div style="display:flex; align-items:center;">
                        <div style="padding-top:2px;">
                            <WIcon
                                :icon="mdiClipboardCheckOutline"
                                :size="24"
                            ></WIcon>
                        </div>
                        <div style="padding-left:7px; font-size:0.85rem; color:#666;">
                            {{textParams}}
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding-bottom:20px; padding-left:20px;">

                <div
                    style="padding:0px 30px 10px 0px; display:inline-block; vertical-align:top;"
                    :key="'kp'+kp"
                    v-for="(p,kp) in piss"
                >

                    <div style="padding-bottom:5px; font-size:0.7rem; color:#999;">
                        {{p.title}}
                    </div>

                    <div
                        :key="'kpi-'+kpi"
                        v-for="(pi,kpi) in p.pis"
                    >
                        <WCheckbox
                            style="white-space:nowrap;"
                            :text="pi.text"
                            :value="getParamCheck(pi)"
                            @input="(v)=>{modifyParamCheck(pi,v)}"
                        >
                            <template v-slot:text="props">
                                <span v-html="props.text"></span>
                            </template>
                        </WCheckbox>
                    </div>

                </div>

            </div>

        </div>

        <div :style="``">

            <div style="padding-bottom:20px;">
                <div style="padding:0px 6px 3px 4px; display:inline-block; border-bottom:1px solid #999;">
                    <div style="display:flex; align-items:center;">
                        <div style="padding-top:2px;">
                            <WIcon
                                :icon="mdiTools"
                                :size="24"
                            ></WIcon>
                        </div>
                        <div style="padding-left:7px; font-size:0.85rem; color:#666;">
                            {{textTools}}
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding-bottom:40px; padding-left:20px;">

                <div style="padding:0px 30px 5px 0px; display:inline-block; vertical-align:middle;">
                    <div style="height:30px;">

                        <div style="padding-top:3px;"></div>

                        <WButtonChip
                            :paddingStyle="{v:1,h:8}"
                            :text="useTextDownloadPic"
                            :icon="mdiDownloadCircleOutline"
                            :borderRadius="4"
                            :editable="!downloadPicProcessing"
                            @click="donwloadPic"
                        ></WButtonChip>

                    </div>
                </div>

                <div style="padding:0px 30px 5px 0px; display:inline-block; vertical-align:middle;">
                    <div style="display:flex; align-items:center; height:30px;">

                        <div style="padding-right:10px; font-size:0.85rem; white-space:nowrap; color:#666;">
                            {{textGeocolMergeSameLayers}}:
                        </div>

                        <WSwitch
                            v-model="geocolMergeSameLayers"
                            @input="modifyGeocolMergeSameLayers"
                        ></WSwitch>

                    </div>
                </div>

                <div style="padding:0px 30px 5px 0px; display:inline-block; vertical-align:middle;">
                    <div style="display:flex; align-items:center; height:30px;">

                        <div style="padding-right:10px; font-size:0.85rem; white-space:nowrap; color:#666;">
                            {{textPlotWithLine}}:
                        </div>

                        <WSwitch
                            v-model="plotWithLine"
                            @input="modifyPlotWithLine"
                        ></WSwitch>

                    </div>
                </div>

                <div style="padding:0px 30px 5px 0px; display:inline-block; vertical-align:middle;">
                    <div style="display:flex; align-items:center; height:30px;">

                        <div style="padding-right:10px; font-size:0.85rem; white-space:nowrap; color:#666;">
                            {{textPlotWidth}}:
                        </div>

                        <WSlider
                            style="width:160px;"
                            :valueMin="240"
                            :valueMax="340"
                            :valueStep="10"
                            :value="plotWidth"
                            @input="modifyPlotWidth"
                        ></WSlider>

                    </div>
                </div>

                <div style="padding:0px 30px 5px 0px; display:inline-block; vertical-align:middle;">
                    <div style="display:flex; align-items:center; height:30px;">

                        <div style="padding-right:10px; font-size:0.85rem; white-space:nowrap; color:#666;">
                            {{textPlotHeight}}:
                        </div>

                        <WSlider
                            style="width:160px;"
                            :valueMin="400"
                            :valueMax="1200"
                            :valueStep="50"
                            :value="plotHeight"
                            @input="modifyPlotHeight"
                        ></WSlider>

                    </div>
                </div>

            </div>

        </div>

        <div :style="``">

            <div style="padding-bottom:10px;">
                <div style="padding:0px 6px 3px 4px; display:inline-block; border-bottom:1px solid #999;">
                    <div style="display:flex; align-items:center;">
                        <div style="padding-top:2px;">
                            <WIcon
                                :icon="mdiChartScatterPlot"
                                :size="24"
                            ></WIcon>
                        </div>
                        <div style="padding-left:7px; font-size:0.85rem; color:#666;">
                            {{textPlots}}
                        </div>
                    </div>
                </div>
            </div>

            <div :style="`width:100%; overflow-x:auto;`">

                <div
                    ref="rpl"
                    style="background:#fff;"
                >

                    <div style="position:relative;">
                        <div style="position:absolute; top:0px; left:0px;">
                            <slot
                                name="zone-top-geolayer"
                            ></slot>
                        </div>
                    </div>

                    <!-- 不提供slot, 調整設定時若有提供slot會造成強制渲染, 進而導致其內組件一直重繪出現效能問題 -->
                    <WSptLiqPlotDepthsWithGrades
                        :sts="useSts"
                        :optionsPic="useOptionsExt"
                    ></WSptLiqPlotDepthsWithGrades>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import { mdiDownloadCircleOutline, mdiClipboardCheckOutline, mdiTools, mdiChartScatterPlot } from '@mdi/js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import isNumber from 'lodash-es/isNumber.js'
import pull from 'lodash-es/pull.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from 'wsemi/src/isestr.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import domConvertToPicDyn from 'wsemi/src/domConvertToPicDyn.mjs'
import downloadFileFromB64 from 'wsemi/src/downloadFileFromB64.mjs'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WCheckbox from 'w-component-vue/src/components/WCheckbox.vue'
import WButtonChip from 'w-component-vue/src/components/WButtonChip.vue'
import WSwitch from 'w-component-vue/src/components/WSwitch.vue'
import WSlider from 'w-component-vue/src/components/WSlider.vue'
import WSptLiqPlotDepthsWithGrades from './WSptLiqPlotDepthsWithGrades.vue'


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
 */
export default {
    components: {
        WIcon,
        WCheckbox,
        WButtonChip,
        WSwitch,
        WSlider,
        WSptLiqPlotDepthsWithGrades,
    },
    props: {
        sts: {
            type: Array,
            default: () => [],
        },
        keyStsSelects: {
            type: Array,
            default: () => [],
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
        textParams: {
            type: String,
            default: 'Parameters', //參數
        },
        textTools: {
            type: String,
            default: 'Tools', //工具
        },
        textPlots: {
            type: String,
            default: 'Plots', //繪圖
        },
        textGeocolMergeSameLayers: {
            type: String,
            default: 'Merge same layers', //土柱合併重複
        },
        textPlotWithLine: {
            type: String,
            default: 'With line', //繪製折線
        },
        textPlotWidth: {
            type: String,
            default: 'Width(px)', //圖寬(px)
        },
        textPlotHeight: {
            type: String,
            default: 'Height(px)', //圖高(px)
        },
        textDownloadPic: {
            type: String,
            default: 'Download image', //下載成為圖片
        },
        textDownloadPicProcessing: {
            type: String,
            default: 'Downloading...', //下載中...
        },
        groupParams: {
            type: Array,
            default: () => {
                return [
                    {
                        title: 'Layer',
                        flts: [
                            {
                                keyFull: 'Geolayer',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Basic',
                        flts: [
                            {
                                keyFull: 'N60',
                                text: '{key}',
                            },
                            {
                                keyFull: 'SPTN',
                                text: '{key}',
                            },
                            {
                                keyPart: 'N160cs', //因部份判斷得要於N160之前執行
                                text: '{key}',
                            },
                            {
                                keyPart: 'N160',
                                text: '{key}',
                            },
                            {
                                keyPart: 'N172cs', //因部份判斷得要於N172之前執行
                                text: '{key}',
                            },
                            {
                                keyPart: 'N172',
                                text: '{key}',
                            },
                            {
                                keyFull: 'GS',
                                text: '{key}',
                            },
                            {
                                keyFull: 'e',
                                text: '{key}',
                            },
                            {
                                keyPart: 'γ',
                                text: '{key}',
                            },
                            {
                                keyFull: 'WC(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'S(%)',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Plastic',
                        flts: [
                            {
                                keyFull: 'LL(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'PL(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'PI(%)',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Particle size',
                        flts: [
                            {
                                keyFull: 'D10(mm)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'D30(mm)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'D50(mm)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'D60(mm)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'ctGravel(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'ctSand(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'ctSilt(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'ctClay(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'ctFine(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'FC(%)',
                                text: '{key}',
                            },
                            {
                                keyFull: 'code',
                                text: '{key}',
                            },
                            {
                                keyFull: 'legendCode',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Stress',
                        flts: [
                            {
                                keyPart: 'stress',
                                text: '{key}',
                            },
                            {
                                keyPart: 'σ',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'CRR & CSR',
                        flts: [
                            {
                                keyPart: '-CRR',
                                text: '{key}',
                            },
                            {
                                keyPart: '-CSR',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'FS',
                        flts: [
                            {
                                keyPart: '-FS',
                                text: '{key}',
                            },
                            {
                                keyPart: '-cmpFS',
                                text: 'Compare-FS',
                            },
                        ],
                    },
                    {
                        title: 'PL',
                        flts: [
                            {
                                keyPart: '-PL',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Vol. strain',
                        flts: [
                            {
                                keyPart: '-vstr',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Settlement',
                        flts: [
                            {
                                keyPart: '-stl',
                                text: '{key}',
                            },
                        ],
                    },
                ]
            },
        },
    },
    data: function() {
        return {
            mdiDownloadCircleOutline,
            mdiClipboardCheckOutline,
            mdiTools,
            mdiChartScatterPlot,

            dbc: debounce(),

            plotWithLine: true,
            plotWidth: 260,
            plotHeight: 550,

            geocolPlotWidth: 350,
            // geocolPlotHeight = plotHeight
            geocolMergeSameLayers: true,

            downloadPicProcessing: false,

            piss: [],

            keyStsSelectsTrans: [],
            kpPis: {},

        }
    },
    computed: {

        changeGroupParams: function() {
            let vo = this

            //ks
            let ks = map(vo.sts, 'key')
            // console.log('sts ks', ks)

            //piss
            let piss = []
            each(vo.groupParams, (gc) => {

                //pis
                let pis = []
                each(gc.flts, (flt) => {
                    // console.log('flt', JSON.stringify(flt))

                    //_pis
                    let _pis = []
                    each(ks, (k) => {

                        //b
                        let b = false
                        if (isestr(flt.keyPart)) {
                            b = k.indexOf(flt.keyPart) >= 0
                        }
                        else if (isestr(flt.keyFull)) {
                            b = k === flt.keyFull
                        }

                        //check
                        if (b) {

                            //text
                            let text = flt.text
                            if (text === '{key}') {
                                text = k
                            }

                            //o
                            let o = {
                                key: k,
                                text,
                            }

                            //push
                            _pis.push(o)

                        }

                    })
                    // console.log('_pis', cloneDeep(_pis))

                    //pull
                    pull(ks, map(_pis, 'key'))
                    // console.log('ks', cloneDeep(ks))

                    //merge
                    pis = [
                        ...pis,
                        ..._pis,
                    ]

                })

                //check
                if (size(pis) === 0) {
                    return true //跳出換下一個
                }

                //push
                piss.push({
                    title: gc.title,
                    pis,
                })

            })
            // console.log('piss', piss)

            //save
            vo.piss = piss

            return ''
        },

        changeKeyStsSelects: function() {
            let vo = this

            //keyStsSelects
            let keyStsSelectsTrans = vo.keyStsSelects

            //kpPis
            let kpPis = {}
            each(vo.sts, (v) => {
                let k = v.key
                let b = false
                each(vo.keyStsSelects, (_k) => {
                    if (k === _k) {
                        b = true
                        return false //跳出
                    }
                })
                kpPis[k] = b
            })
            // console.log('kpPis', kpPis)

            //save
            vo.keyStsSelectsTrans = keyStsSelectsTrans
            vo.kpPis = kpPis

            return ''
        },

        useSts: function() {
            let vo = this

            //sts
            let sts = []
            each(vo.sts, (v) => {
                // console.log(v)

                //b
                let b = get(vo.kpPis, v.key, false)
                // console.log(v.key, b)

                //check
                if (!b) {
                    return true //跳出換下一個
                }

                //width
                let _width = get(v, 'width', '')
                let width = vo.plotWidth
                if (isNumber(_width)) {
                    width = _width
                }

                //height
                let _height = get(v, 'height', '')
                let height = vo.plotHeight
                if (isNumber(_height)) {
                    height = _height
                }

                //plotType
                let plotType = get(v, 'plotType', '')
                if (vo.plotWithLine) {
                    plotType = 'line+marker'
                }
                else {
                    plotType = 'marker'
                }

                //st
                let st = {
                    ...v,
                    width,
                    height,
                    plotType,
                }

                //push
                sts.push(st)

            })

            return sts
        },

        useOptionsExt: function() {
            let vo = this

            //optionsPic
            let optionsPic = {
                ...vo.optionsPic,
                geocolMergeSameLayers: vo.geocolMergeSameLayers,
            }

            return optionsPic
        },

        useTextDownloadPic: function() {
            let vo = this
            return vo.downloadPicProcessing ? vo.textDownloadPicProcessing : vo.textDownloadPic
        },

    },
    methods: {

        modifyGeocolMergeSameLayers: function() {
            //console.log('methods modifyGeocolMergeSameLayers')
            // let vo = this
        },

        modifyPlotWithLine: function() {
            //console.log('methods modifyPlotWithLine')
            // let vo = this
        },

        modifyPlotWidth: function(plotWidth) {
            // console.log('methods modifyPlotWidth', plotWidth)

            let vo = this

            //dbc
            vo.dbc(() => {
                vo.plotWidth = plotWidth
                // console.log('dbc plotWidth', plotWidth)
            })

        },

        modifyPlotHeight: function(plotHeight) {
            // console.log('methods modifyPlotHeight', plotHeight)

            let vo = this

            //dbc
            vo.dbc(() => {
                vo.plotHeight = plotHeight
                // console.log('dbc plotHeight', plotHeight)
            })

        },

        donwloadPic: function() {
            //console.log('methods donwloadPic')

            let vo = this

            async function core() {

                //downloadPicProcessing
                vo.downloadPicProcessing = true

                //ele
                let ele = get(vo, '$refs.rpl', null)
                if (!ele) {
                    return Promise.reject('invalid ele')
                }

                //b64
                let b64 = await domConvertToPicDyn(ele, { scale: 3 })

                //downloadFileFromB64
                downloadFileFromB64('plot.png', b64)

            }

            //core
            core()
                .catch((err) => {
                    console.log(err)
                })
                .finally(() => {

                    //downloadPicProcessing
                    vo.downloadPicProcessing = false

                })

        },

        getParamCheck: function(pi) {
            // console.log('methods getParamCheck', pi)

            let vo = this

            let b = get(vo.kpPis, pi.key, false)
            // console.log('getParamCheck', b)

            return b
        },

        modifyParamCheck: function(pi, b) {
            // console.log('methods modifyParamCheck', pi, b)

            let vo = this

            //cloneDeep
            let kpPis = cloneDeep(vo.kpPis)

            //kpPis
            kpPis[pi.key] = b
            // console.log('kpPis', kpPis)

            //keyStsSelectsTrans
            let keyStsSelectsTrans = []
            each(kpPis, (b, k) => {
                if (b) {
                    keyStsSelectsTrans.push(k)
                }
            })
            // console.log('keyStsSelectsTrans', keyStsSelectsTrans)

            //update
            vo.keyStsSelectsTrans = keyStsSelectsTrans
            vo.kpPis = kpPis

            //emit
            vo.$emit('update:keyStsSelects', keyStsSelectsTrans)

        },

    }
}
</script>

<style scoped>
</style>
