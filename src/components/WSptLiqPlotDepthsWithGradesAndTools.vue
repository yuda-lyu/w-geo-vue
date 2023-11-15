<template>
    <div
        :style="``"
        :changeParam="changeParam"
    >

        <div :style="``">

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
                    ></WCheckbox>
                </div>

            </div>

        </div>

        <div :style="``">

            <div style="padding-bottom:5px; font-size:0.7rem; color:#999;">
                Tools
            </div>

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

        <div
            ref="rpl"
            style="background:#fff;"
        >

            <div style="position:relative;">
                <div style="position:absolute; top:0px; left:0px;">
                    <slot></slot>
                </div>
            </div>

            <!-- 不提供slot, 調整設定時若有提供slot會造成強制渲染, 進而導致其內組件一直重繪出現效能問題 -->
            <WSptLiqPlotDepthsWithGrades
                :sts="useSts"
                :optionsExt="useOptionsExt"
            ></WSptLiqPlotDepthsWithGrades>

        </div>

    </div>
</template>

<script>
import { mdiDownloadCircleOutline } from '@mdi/js'
import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import pull from 'lodash/pull'
import cloneDeep from 'lodash/cloneDeep'
import isobj from 'wsemi/src/isobj.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import domConvertToPicDyn from 'wsemi/src/domConvertToPicDyn.mjs'
import downloadFileFromB64 from 'wsemi/src/downloadFileFromB64.mjs'
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
        optionsExt: {
            type: Object,
            default: () => {},
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
            default: 'Download', //下載成為圖片
        },
        textDownloadPicProcessing: {
            type: String,
            default: 'Downloading...', //下載中...
        },
        groupChecks: {
            type: Array,
            default: () => {
                return [
                    {
                        title: 'Layers',
                        flts: [
                            {
                                key: 'Geolayer',
                                text: 'Geo-Layers',
                            },
                        ],
                    },
                    {
                        title: 'Basic',
                        flts: [
                            {
                                key: 'N60',
                                text: 'N60',
                            },
                            {
                                key: 'FC(%)',
                                text: 'FC(%)',
                            },
                        ],
                    },
                    {
                        title: 'Stress',
                        flts: [
                            {
                                key: 'Vertical stress(MPa)',
                                text: 'Vertical stress(MPa)',
                            },
                            {
                                key: 'Effective vertical stress(MPa)',
                                text: 'Effective vertical stress(MPa)',
                            },
                        ],
                    },
                    {
                        title: 'PL',
                        flts: [
                            {
                                key: '-PL',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Vol. strain',
                        flts: [
                            {
                                key: '-vstr',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Settlement',
                        flts: [
                            {
                                key: '-stl',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'FS',
                        flts: [
                            {
                                key: '-FS',
                                text: '{key}',
                            },
                        ],
                    },
                    {
                        title: 'Compare FS',
                        flts: [
                            {
                                key: '-cmpFS',
                                text: 'Compare-FS',
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

            dbc: debounce(),

            plotWithLine: true,
            plotWidth: 260,
            plotHeight: 550,

            geocolPlotWidth: 350,
            // geocolPlotHeight = plotHeight
            geocolMergeSameLayers: true,

            downloadPicProcessing: false,

            piss: [],
            kpPis: null,

        }
    },
    computed: {

        changeParam: function() {
            let vo = this

            //ks
            let ks = map(vo.sts, 'key')

            //piss, pisAll
            let piss = []
            let pisAll = []
            each(vo.groupChecks, (gc) => {

                //pis
                let pis = []
                each(gc.flts, (flt) => {

                    //_pis
                    let _pis = []
                    each(ks, (k) => {
                        let b = k.indexOf(flt.key) >= 0
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
                            pisAll.push(o)

                        }
                    })

                    //pull
                    pull(ks, map(_pis, 'key'))

                    //merge
                    pis = [
                        ...pis,
                        ..._pis,
                    ]

                })

                //push
                piss.push({
                    title: gc.title,
                    pis,
                })

            })

            //kpPis
            let kpPis = vo.kpPis
            if (kpPis === null) {
                kpPis = {}
                each(pisAll, (v) => {
                    kpPis[v.key] = true
                })
            }

            //save
            vo.piss = piss
            vo.kpPis = kpPis
            // console.log('piss', piss)
            // console.log('kpPis', kpPis)

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

            //optionsExt
            let optionsExt = {
                ...vo.optionsExt,
                geocolMergeSameLayers: vo.geocolMergeSameLayers,
            }

            return optionsExt
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

            //check
            if (!isobj(vo.kpPis)) {
                vo.kpPis = {}
            }

            //kpPis
            let kpPis = cloneDeep(vo.kpPis)

            //modify
            kpPis[pi.key] = b

            //update
            vo.kpPis = kpPis

        },

    }
}
</script>

<style scoped>
</style>
