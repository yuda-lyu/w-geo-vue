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
                <WTableEdit
                    :style="`width:100%; height:${heightTable}px;`"
                    :enableInfor="false"
                    :name="''"
                    :description="''"
                    :opt="optTable"
                    :editable="false"
                    @success="evSuccess"
                    @error="evError"
                    v-bind="optionsTable"
                ></WTableEdit>
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
import WTableEdit from 'w-table-vue/src/components/WTableEdit.vue'
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
 * 提供SPT液化分析之整合組件，含分析方法勾選區、分析結果數據表格(WTableEdit)，以及分析結果之深度剖線繪圖區(WSptLiqPlotDepthsWithGradesAndTools)
 *
 * 內部先依kpTransRowKey轉換rows各欄位key，再以w-geo之calcLiquefaction計算液化分析，並由計算結果產生表格設定與各參數繪圖狀態物件。地下水位取自rows第1筆之waterLevel、waterLevelUsual、waterLevelDesign(依序覆蓋)
 *
 * 表格為唯讀不提供編輯，計算結果中key含'-err'與'-stateFS'者會自動轉換角括號為HTML實體字元並開啟儲存格提示框
 *
 * 具名插槽(slot)：'zone-top'為繪圖區上方之資訊區塊，提供作用域參數row0(分析結果第1筆)、rown(分析結果最末筆)、rows(分析結果全部)
 *
 * @vue-prop {Array} [sptMethods] 輸入可供勾選之液化分析方法字串陣列，預設['sptSeed','sptHBF2012','sptHBF2017','sptNCEER','sptNJRA1996','sptNJRA2017','sptTY']
 * @vue-prop {Array} [sptMethodsSelects] 輸入已勾選之液化分析方法字串陣列，可使用.sync雙向綁定，預設['sptHBF2017','sptNJRA2017']
 * @vue-prop {String} [unitSvSvp='MPa'] 輸入應力單位字串，供取代kpHead內之'{unitSvSvp}'標記，預設'MPa'
 * @vue-prop {Array} [rows=[]] 輸入各深度之土層與試驗數據物件陣列，預設[]
 * @vue-prop {Object} [kpTransRowKey] 輸入rows各欄位key之轉換對照物件，key為輸入資料欄位key，值為分析用欄位key，預設已提供SPTN、Gt_dry、Gt_sat、ctFine、code、USCS等對照
 * @vue-prop {Object} [kpHead] 輸入分析用欄位key對應表格標題與繪圖軸標題之物件，值可使用底線與上下標語法，並可使用'{unitSvSvp}'標記代表應力單位，預設已提供PGA、depth、waterLevel、WC、PI、FC、γ、σ等對照
 * @vue-prop {Object} [kpDig] 輸入分析用欄位key對應表格數值取用小數點位數之物件，預設已提供depth、N60、WC、γ、σ、D10等對照
 * @vue-prop {Array} [keyParamSelects] 輸入預設勾選繪圖參數之過濾設定物件陣列，僅於外部未給予keyStsSelects時套用，物件可給予keyFull(需完全相同)或keyPart(需部份含有)，預設已提供Geolayer、N60、FC(%)、-FS、-cmpFS、-PL、-stl等過濾
 * @vue-prop {String} [depthTitle='Depth(m)'] 輸入繪圖深度軸標題字串，預設'Depth(m)'
 * @vue-prop {Object} [optionsPic={}] 輸入繪圖設定物件，鍵值同WSptLiqPlotDepthsWithGradesAndTools之optionsPic並向下傳遞，預設{}
 * @vue-prop {Object} [optionsTable={}] 輸入提供組件WTableEdit之額外參數物件，預設{}
 * @vue-prop {Object} [optionsToolPlot={}] 輸入提供組件WSptLiqPlotDepthsWithGradesAndTools之額外參數物件，預設{}
 * @vue-prop {Object} [optionsMethodData={}] 輸入標題文字設定物件，預設{}
 * @vue-prop {String} [optionsMethodData.textMethods='Methods'] 輸入分析方法勾選區標題字串，預設'Methods'
 * @vue-prop {String} [optionsMethodData.textTable='Table data'] 輸入數據表格區標題字串，預設'Table data'
 * @vue-data {Array} sptMethodsSelectsTrans 儲存內部使用之已勾選液化分析方法字串陣列
 * @vue-data {Object} kpMehtodSelect 儲存液化分析方法對應是否勾選物件
 * @vue-data {Number} heightTable 儲存數據表格高度數字，單位px
 * @vue-data {Array} rowsTrans 儲存內部使用之輸入數據物件陣列
 * @vue-data {Object} optTable 儲存供WTableEdit使用之表格設定物件
 * @vue-data {Array} sts 儲存分析結果各參數之繪圖狀態物件陣列
 * @vue-data {Array} keyStsSelects 儲存已勾選繪製參數之key字串陣列
 * @vue-computed {String} textMethods 回傳分析方法勾選區標題字串
 * @vue-computed {String} textTable 回傳數據表格區標題字串
 * @vue-computed {Boolean} hasSelects 回傳是否已勾選液化分析方法布林值
 * @vue-computed {Boolean} hasSts 回傳是否已有繪圖狀態物件布林值
 * @vue-computed {Object} useKpHead 回傳已取代應力單位與轉換上下標語法之欄位標題對照物件
 * @vue-computed {Array} rowsResult 回傳液化分析結果之數據物件陣列
 * @vue-computed {Object} row0Result 回傳液化分析結果第1筆數據物件
 * @vue-computed {Object} rowNResult 回傳液化分析結果最末筆數據物件
 * @vue-event {Array} update:sptMethodsSelects 當使用者勾選或取消液化分析方法時，回傳已勾選方法之字串陣列
 */
export default {
    components: {
        WIcon,
        WCheckbox,
        WTableEdit,
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
        optionsTable: { //提供組件WTableEdit額外參數
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
