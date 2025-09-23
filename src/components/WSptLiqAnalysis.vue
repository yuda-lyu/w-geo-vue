<template>
    <div
        :style="``"
        :changeRows="changeRows"
        :changeRowsTrans="changeRowsTrans"
        :changeSptMethodsSelects="changeSptMethodsSelects"
        :changeStsAndKeyParamSelects="changeStsAndKeyParamSelects"
    >

        <div :style="``">

            <div style="padding-bottom:20px;">
                <div style="padding:0px 6px 3px 6px; display:inline-block; border-bottom:1px solid #999;">
                    <div style="display:flex; align-items:center;">
                        <div style="padding-top:2px;">
                            <WIcon
                                :icon="mdiBookOpenPageVariantOutline"
                                :size="24"
                            ></WIcon>
                        </div>
                        <div style="padding-left:10px; font-size:0.85rem; color:#666;">
                            {{textMethods}}
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding-bottom:30px; padding-left:20px;">

                <div
                    :style="`display:inline-block; padding:0px 15px 5px 0px;`"
                    :key="'km-'+km"
                    v-for="(m,km) in sptMethods"
                >
                    <WCheckbox
                        style="white-space:nowrap;"
                        :text="m"
                        :value="getMethodCheck(m)"
                        @input="(v)=>{modifyMethodCheck(m,v)}"
                    >
                    </WCheckbox>
                </div>

            </div>

        </div>

        <div
            :style="``"
            v-if="hasSelects"
        >

            <div style="padding-bottom:10px;">
                <div style="padding:0px 6px 3px 4px; display:inline-block; border-bottom:1px solid #999;">
                    <div style="display:flex; align-items:center;">
                        <div style="padding-top:2px;">
                            <WIcon
                                :icon="mdiFileTableBoxOutline"
                                :size="24"
                            ></WIcon>
                        </div>
                        <div style="padding-left:7px; font-size:0.85rem; color:#666;">
                            {{textTable}}
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding-bottom:40px;">
                <!-- 關閉編輯功能, 待日後開發 -->
                <WTableDyn
                    :style="`width:100%; height:${heightTable}px;`"
                    :enableInfor="false"
                    :name="''"
                    :description="''"
                    :opt="optTable"
                    :editable="false"
                    @success="evSuccess"
                    @error="evError"
                    v-bind="optionsTable"
                ></WTableDyn>
            </div>

        </div>

        <div
            :style="``"
            v-if="hasSelects && hasSts"
        >

            <WSptLiqPlotDepthsWithGradesAndTools
                :sts="sts"
                :optionsPic="optionsPic"
                v-bind="optionsToolPlot"
                :keyStsSelects.sync="keyStsSelects"
            >
                <template v-slot:zone-top>
                    <slot
                        name="zone-top"
                        :row0="row0Result"
                        :rown="rowNResult"
                        :rows="rowsResult"
                    ></slot>
                </template>
            </WSptLiqPlotDepthsWithGradesAndTools>

        </div>

    </div>
</template>

<script>
import { mdiBookOpenPageVariantOutline, mdiFileTableBoxOutline } from '@mdi/js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import keys from 'lodash-es/keys.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import dig from 'wsemi/src/dig.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import calcLiquefaction from 'w-geo/src/calcLiquefaction.mjs'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WCheckbox from 'w-component-vue/src/components/WCheckbox.vue'
import WTableDyn from 'w-component-vue/src/components/WTableDyn.vue'
import WSptLiqPlotDepthsWithGradesAndTools from './WSptLiqPlotDepthsWithGradesAndTools.vue'
import getSts from '../js/getSts.mjs'
import spc2html from '../js/spc2html.mjs'


function escapeHTML(c) {
    c = cstr(c)
    if (isestr(c)) {
        c = c
            // .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // .replace(/"/g, '&quot;')
            // .replace(/'/g, '&#39;')
    }
    return c
}


function anaSptLiq(rowsIn, opt = {}) {

    //kpHead
    let kpHead = get(opt, 'kpHead', {})

    //kpDig
    let kpDig = get(opt, 'kpDig', {})

    //depthTitle
    let depthTitle = get(opt, 'depthTitle', 'Depth(m)')

    //geolayerWidth
    let geolayerWidth = get(opt, 'geolayerWidth', 240)

    //geolayerWaterLevel
    let geolayerWaterLevel = get(opt, 'geolayerWaterLevel', 0)

    //rowsOut
    let rowsOut = calcLiquefaction.calc('SPT', rowsIn, opt)
    // console.log('rowsOut', cloneDeep(rowsOut))

    //escapeHTML, 因-err與-stateFS會含有<>符號, ag-grid會無法正常顯示, 得先取代成html專用顯示符號
    rowsOut = map(rowsOut, (r) => {
        let rr = {}
        each(r, (v, k) => {
            if (
                k.indexOf('-err') >= 0 ||
                k.indexOf('-stateFS') >= 0 ||
                false
            ) {
                v = escapeHTML(v)
            }
            rr[k] = v
        })
        return rr
    })
    // console.log('rowsOut(escapeHTML)', cloneDeep(rowsOut))

    //rowOut0
    let rowOut0 = get(rowsOut, 0, {})

    //ks
    let ks = keys(rowOut0)
    // console.log('ks', ks)

    //kpHeadRender
    let kpHeadRender = {}
    each(kpHead, (v, k) => {
        kpHeadRender[k] = () => {
            return v
        }
    })

    //kpCellTooltip, 因-err與-stateFS可能文字訊息過長, 故須開啟
    let kpCellTooltip = {}
    each(ks, (k) => {
        if (
            k.indexOf('-err') >= 0 ||
            k.indexOf('-stateFS') >= 0 ||
            false
        ) {
            kpCellTooltip[k] = (v) => {
                return v
            }
        }
    })

    //kpCellRender
    let kpCellRender = {}
    each(kpDig, (idig, k) => {
        kpCellRender[k] = (v) => {
            if (isnum(v)) {
                v = dig(v, idig)
            }
            return v
        }
    })
    // console.log('kpCellRender', kpCellRender)

    //optTable
    let optTable = {}
    if (true) {
        optTable = {
            keys: ks,
            rows: rowsOut,
            defHeadSortMethod: 'auto',
            defCellEditable: false, //關閉編輯功能, 待日後開發
            defCellAlighH: 'left',
            kpHead,
            kpHeadRender,
            kpCellTooltip,
            kpCellRender,
        }
    }

    //sts
    let sts = getSts(rowsOut, kpHead, depthTitle, geolayerWidth, geolayerWaterLevel)
    // console.log('sts', sts)

    return {
        optTable,
        sts,
    }
}


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
 */
export default {
    components: {
        WIcon,
        WCheckbox,
        WTableDyn,
        WSptLiqPlotDepthsWithGradesAndTools,
    },
    props: {
        sptMethods: {
            type: Array,
            default: () => {
                return [
                    'sptSeed',
                    'sptHBF2012',
                    'sptHBF2017',
                    'sptNCEER',
                    'sptNJRA1996',
                    'sptNJRA2017',
                    'sptTY',
                ]
            },
        },
        sptMethodsSelects: {
            type: Array,
            default: () => {
                return [
                    'sptHBF2017',
                    'sptNJRA2017',
                ]
            },
        },
        unitSvSvp: {
            type: String,
            default: 'MPa',
        },
        rows: {
            type: Array,
            default: () => [],
        },
        kpTransRowKey: {
            type: Object,
            default: () => {
                return {
                    'SPTN': 'N60',
                    'Gt_dry': 'rd',
                    'Gt_sat': 'rsat',
                    'ctFine': 'FC',
                    'code': 'legendCode',
                    'USCS': 'soilClassification',
                }
            },
        },
        kpHead: {
            type: Object,
            default: () => {
                return {
                    'PGA': 'PGA(g)',
                    'depth': 'depth(m)',
                    'depthStart': 'depthStart(m)',
                    'depthEnd': 'depthEnd(m)',
                    'waterLevelUsual': 'waterLevelUsual(m)',
                    'waterLevelDesign': 'waterLevelDesign(m)',
                    'WC': 'WC(%)',
                    'PI': 'PI(%)',
                    'PL': 'PL(%)',
                    'LL': 'LL(%)',
                    'S': 'S(%)',
                    'FC': 'FC(%)',
                    'rd': 'γ<sub>dry</sub>(kN/m3)',
                    'rsat': 'γ<sub>sat</sub>(kN/m3)',
                    'sv': 'σ<sub>v</sub>({unitSvSvp})',
                    'svp': `σ'<sub>v</sub>({unitSvSvp})`,
                    'svpUsual': `σ'<sub>v,usual</sub>({unitSvSvp})`,
                    'svpDesign': `σ'<sub>v,design</sub>({unitSvSvp})`,
                    'D10': 'D10(mm)',
                    'D30': 'D30(mm)',
                    'D50': 'D50(mm)',
                    'D60': 'D60(mm)',
                    'ctGravel': 'ctGravel(%)',
                    'ctSand': 'ctSand(%)',
                    'ctSilt': 'ctSilt(%)',
                    'ctClay': 'ctClay(%)',
                }
            },
        },
        kpDig: {
            type: Object,
            default: () => {
                return {
                    'depth': 3,
                    'depthStart': 3,
                    'depthEnd': 3,
                    'waterLevelUsual': 1,
                    'waterLevelDesign': 1,
                    'N60': 1,
                    'WC': 1,
                    'PI': 1,
                    'PL': 1,
                    'LL': 1,
                    'S': 2,
                    'rd': 2,
                    'rsat': 2,
                    'sv': 4,
                    'svp': 4,
                    'svpUsual': 4,
                    'svpDesign': 4,
                    'D10': 5,
                    'D30': 5,
                    'D50': 5,
                    'D60': 5,
                    'ctGravel': 1,
                    'ctSand': 1,
                    'ctSilt': 1,
                    'ctClay': 1,
                    'FC': 1,
                }
            },
        },
        keyParamSelects: {
            type: Array,
            default: () => {
                return [
                    {
                        keyFull: 'Geolayer',
                    },
                    {
                        keyPart: 'N60',
                    },
                    // {
                    //     keyPart: 'γ',
                    // },
                    // {
                    //     keyFull: 'PI(%)',
                    // },
                    {
                        keyFull: 'FC(%)',
                    },
                    {
                        keyPart: '-FS',
                    },
                    // {
                    //     keyPart: '-stateFS', //儲存文字無法繪圖
                    // },
                    {
                        keyPart: '-cmpFS',
                    },
                    {
                        keyPart: '-PL',
                    },
                    {
                        keyPart: '-stl',
                    },
                ]
            },
        },
        depthTitle: {
            type: String,
            default: 'Depth(m)',
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
        optionsTable: { //提供組件WTableDyn額外參數
            type: Object,
            default: () => {},
        },
        optionsToolPlot: { //提供組件WSptLiqPlotDepthsWithGradesAndTools額外參數
            type: Object,
            default: () => {},
        },
        optionsMethodData: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {
            mdiBookOpenPageVariantOutline,
            mdiFileTableBoxOutline,

            // dbc: debounce(),

            sptMethodsSelectsTrans: [],
            kpMehtodSelect: {},

            heightTable: 400,

            rowsTrans: [],

            optTable: {},

            sts: [],
            keyStsSelects: [],

        }
    },
    computed: {

        changeRows: function() {
            let vo = this

            //save
            vo.rowsTrans = vo.rows

            return ''
        },

        changeRowsTrans: function() {
            let vo = this

            //trigger
            let rowsTrans = vo.rowsTrans

            //analysis
            vo.analysis(rowsTrans)

            return ''
        },

        changeSptMethodsSelects: function() {
            let vo = this

            //kpMehtodSelect
            let kpMehtodSelect = {}
            each(vo.sptMethodsSelects, (m) => {
                kpMehtodSelect[m] = true
            })

            //save
            vo.sptMethodsSelectsTrans = vo.sptMethodsSelects
            vo.kpMehtodSelect = kpMehtodSelect

            return ''
        },

        changeStsAndKeyParamSelects: function() {
            let vo = this

            //check, 若已經有預選或使用者已切換選則, 則不再變更
            if (isearr(vo.keyStsSelects)) {
                return ''
            }

            //kpPis
            let kpPis = {}
            if (isearr(vo.keyParamSelects)) {
                each(vo.sts, (v) => {
                    let k = v.key
                    each(vo.keyParamSelects, (flt) => {

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
                            kpPis[k] = true
                        }

                    })
                })
            }
            // console.log('kpPis', kpPis)

            //keyStsSelects
            let keyStsSelects = []
            each(kpPis, (b, k) => {
                if (b) {
                    keyStsSelects.push(k)
                }
            })
            // console.log('keyStsSelects', keyStsSelects)

            //update
            vo.keyStsSelects = keyStsSelects

            return ''
        },

        textMethods: function() {
            let vo = this
            let t = get(vo, 'optionsMethodData.textMethods', 'Methods') //液化分析方法
            return t
        },

        textTable: function() {
            let vo = this
            let t = get(vo, 'optionsMethodData.textTable', 'Table data') //數據表格
            return t
        },

        hasSelects: function() {
            let vo = this
            let b = size(vo.sptMethodsSelectsTrans) > 0
            return b
        },

        hasSts: function() {
            let vo = this
            let b = size(vo.sts) > 0
            return b
        },

        useKpHead: function() {
            let vo = this
            let kp = {}
            each(vo.kpHead, (v, k) => {
                if (v.indexOf('{unitSvSvp}') >= 0) {
                    v = v.replaceAll('{unitSvSvp}', vo.unitSvSvp)
                }
                kp[k] = spc2html(v)
            })
            return kp
        },

        rowsResult: function() {
            let vo = this
            let rows = get(vo, 'optTable.rows', [])
            return rows
        },

        row0Result: function() {
            let vo = this
            let row = get(vo, 'rowsResult.0', {})
            return row
        },

        rowNResult: function() {
            let vo = this
            let n = size(vo.rowsResult)
            let row = get(vo, `rowsResult.${n - 1}`, {})
            return row
        },

    },
    methods: {

        analysis: function() {
            let vo = this

            let rowsIn = vo.rowsTrans
            // console.log('rowsIn', cloneDeep(rowsIn))

            //kpTransRowKey
            rowsIn = map(rowsIn, (row) => {
                let r = {}
                each(row, (v, k) => {
                    if (haskey(vo.kpTransRowKey, k)) {
                        k = vo.kpTransRowKey[k]
                    }
                    r[k] = v
                })
                return r
            })
            // console.log('rowsIn(kpTransRowKey)', cloneDeep(rowsIn))

            //waterLevel
            let waterLevel = 0
            if (true) {
                let wl
                wl = get(rowsIn, '0.waterLevel', '')
                if (isnum(wl)) {
                    waterLevel = cdbl(wl)
                }
                wl = get(rowsIn, '0.waterLevelUsual', '')
                if (isnum(wl)) {
                    waterLevel = cdbl(wl)
                }
                wl = get(rowsIn, '0.waterLevelDesign', '')
                if (isnum(wl)) {
                    waterLevel = cdbl(wl)
                }
            }

            // //add params
            // rowsIn = map(rowsIn, (row) => {

            //     if (!isnum(row.waterLevelUsual) && isNumber(vo.waterLevelUsual)) {
            //         row.waterLevelUsual = vo.waterLevelUsual
            //     }
            //     else if (isnum(row.waterLevelUsual)) {
            //         row.waterLevelUsual = cdbl(row.waterLevelUsual)
            //     }

            //     if (!isnum(row.waterLevelDesign) && isNumber(vo.waterLevelDesign)) {
            //         row.waterLevelDesign = vo.waterLevelDesign
            //     }
            //     else if (isnum(row.waterLevelDesign)) {
            //         row.waterLevelDesign = cdbl(row.waterLevelDesign)
            //     }

            //     if (!isnum(row.PGA) && isNumber(vo.PGA)) {
            //         row.PGA = vo.PGA
            //     }
            //     else if (isnum(row.PGA)) {
            //         row.PGA = cdbl(row.PGA)
            //     }

            //     if (!isnum(row.Mw) && isNumber(vo.Mw)) {
            //         row.Mw = vo.Mw
            //     }
            //     else if (isnum(row.Mw)) {
            //         row.Mw = cdbl(row.Mw)
            //     }

            //     return row
            // })
            // // console.log('rowsIn(add params)', cloneDeep(rowsIn))

            let opt = {
                // waterLevelUsual: vo.waterLevelUsual,
                // waterLevelDesign: vo.waterLevelDesign,
                // PGA: vo.PGA,
                // Mw: vo.Mw,
                unitSvSvp: vo.unitSvSvp,
                methods: vo.sptMethodsSelectsTrans,
                kpHead: vo.useKpHead,
                kpDig: vo.kpDig,
                depthTitle: vo.depthTitle,
                geolayerWaterLevel: waterLevel, //由rows[0]取得
            }
            // console.log('opt', opt)

            //anaSptLiq
            let r = anaSptLiq(rowsIn, opt)
            //console.log('r', r)

            //save
            vo.optTable = r.optTable
            vo.sts = r.sts

        },

        evSuccess: function(msg) {
            console.log('evSuccess:', msg)
        },

        evError: function(msg) {
            console.log('evError:', msg)
        },

        getMethodCheck: function(m) {
            // console.log('methods getMethodCheck', m)

            let vo = this

            let b = get(vo.kpMehtodSelect, m, false)
            // console.log('getMethodCheck', b)

            return b
        },

        modifyMethodCheck: function(m, b) {
            // console.log('methods modifyMethodCheck', m, b)

            let vo = this

            //kpMehtodSelect
            let kpMehtodSelect = cloneDeep(vo.kpMehtodSelect)

            //modify
            kpMehtodSelect[m] = b

            //sptMethodsSelects
            let sptMethodsSelects = []
            each(kpMehtodSelect, (v, k) => {
                if (v) {
                    sptMethodsSelects.push(k)
                }
            })

            //update
            vo.sptMethodsSelectsTrans = sptMethodsSelects
            vo.kpMehtodSelect = kpMehtodSelect
            // console.log('sptMethodsSelects', sptMethodsSelects)
            // console.log('kpMehtodSelect', kpMehtodSelect)

            //emit
            vo.$emit('update:sptMethodsSelects', sptMethodsSelects)

        },

    }
}
</script>

<style scoped>
</style>
