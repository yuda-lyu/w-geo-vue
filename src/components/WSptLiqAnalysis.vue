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
                <template v-slot:zone-top-geolayer>
                    <slot
                        name="zone-top-geolayer"
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
import filter from 'lodash-es/filter.js'
import isNumber from 'lodash-es/isNumber.js'
import pull from 'lodash-es/pull.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import strleft from 'wsemi/src/strleft.mjs'
import calcLiquefaction from 'w-geo/src/calcLiquefaction.mjs'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WCheckbox from 'w-component-vue/src/components/WCheckbox.vue'
import WTableDyn from 'w-component-vue/src/components/WTableDyn.vue'
import WSptLiqPlotDepthsWithGradesAndTools from './WSptLiqPlotDepthsWithGradesAndTools.vue'
import spc2html from '../js/spc2html.mjs'


function cvRowsToStsGeolayer(rows, depthTitle, width, waterLevel) {

    //cvUscsToCode
    let cvUscsToCode = (USCS) => {
        let l1 = strleft(USCS, 1)
        let kp = {
            'G': '207',
            'S': '227',
            'M': '105',
            'C': '106',
            '岩': '207',
            '回': '207',
        }
        if (haskey(kp, l1)) {
            return kp[l1]
        }
        return kp['C'] //查不到則預設給予黏土
    }

    //data
    let data = []
    each(rows, (r, kr) => {
        let depthStart = get(r, 'depthStart', '')
        let depthEnd = get(r, 'depthEnd', '')
        let depth = get(r, 'depth', '')
        let legendCode = get(r, 'legendCode', '')
        let description = get(r, 'description', '')
        let soilClassification = get(r, 'soilClassification', '')

        //check
        if (!isestr(legendCode) && isestr(soilClassification)) {
            legendCode = cvUscsToCode(soilClassification)
        }

        let dsp = ''
        if (isestr(description) && !isestr(soilClassification)) {
            dsp = description
        }
        else if (!isestr(description) && isestr(soilClassification)) {
            dsp = soilClassification
        }
        else if (isestr(description) && isestr(soilClassification)) {
            dsp = `${soilClassification}, ${description}`
        }

        let d = {
            depthStart,
            depthEnd,
            depth,
            legendCode,
            description: dsp,
        }

        data.push(d)

    })
    // console.log('data', data)

    //st
    let st = {
        key: 'Geolayer',
        width,
        // height: 550,
        valueTitle: 'geologic',
        depthTitle,
        // depthMin: 0, //不須使用
        // depthMax: 20, //不須使用
        waterLevel,
        item: {
            type: 'Geolayer',
            name: '',
            data,
        },
        plotType: 'none',
    }
    // console.log('st', st)

    return st
}


function cvRowsToStsParam(key, valueTitle, depthTitle, depthMin, depthMax, depths, params) {

    //data
    let data = []
    each(depths, (depth, k) => {

        //v
        let v = get(params, k, null)
        if (isnum(v)) {
            v = cdbl(v)
        }
        else {
            v = null //非數字則使用null, 使highcharts能略過繪圖點
        }

        //d
        let d = [depth, v]

        //push
        data.push(d)

    })
    // console.log('data', data)

    //st
    let st = {
        key,
        // width: 260,
        // height: 550,
        valueTitle,
        depthTitle,
        depthMin,
        depthMax,
        item: {
            name: key,
            data,
        },
        plotType: 'line+marker',
    }
    // console.log('st', st)

    return st
}


function cvRowsToStsCmpFS(rows, depthTitle, depthMin, depthMax, depths) {

    //row0
    let row0 = get(rows, 0, {})

    //ks
    let ks = keys(row0)
    ks = filter(ks, (k) => {
        return k.indexOf('-FS') >= 0
    })

    //ds
    let ds = []
    each(ks, (key) => {

        //data
        let data = []
        each(depths, (depth, k) => {

            //row
            let row = get(rows, k, null)

            //v
            let v = get(row, key, null)
            if (isnum(v)) {
                v = cdbl(v)
            }
            else {
                v = null //非數字則使用null, 使highcharts能略過繪圖點
            }

            //d
            let d = [depth, v]

            //push
            data.push(d)

        })
        // console.log('data', data)

        //d
        let d = {
            name: key,
            data,
        }

        //push
        ds.push(d)

    })
    // console.log('ds', ds)

    //st
    let st = {
        key: 'All-cmpFS',
        // width: 260,
        // height: 550,
        valueTitle: 'FS',
        depthTitle,
        depthMin,
        depthMax,
        item: {
            name: 'All-cmpFS',
            data: ds,
        },
        plotType: 'line+marker',
    }
    // console.log('st', st)

    return st
}


function cvRowsToSts(rows, kpCvKey, depthTitle, geolayerWidth, geolayerWaterLevel) {

    //row0
    let row0 = get(rows, 0, {})

    //ks
    let ks = keys(row0)
    pull(ks, ...['depthStart', 'depthEnd', 'depth'])
    // console.log('ks', ks)

    //depthMin, depthMax
    let depthMin = 1e20
    let depthMax = -1e20
    each(rows, (v) => {
        let ds = get(v, 'depthStart')
        let de = get(v, 'depthEnd')
        if (isnum(ds)) {
            ds = cdbl(ds)
            depthMin = Math.min(depthMin, ds)
            depthMax = Math.max(depthMax, ds)
        }
        if (isnum(de)) {
            de = cdbl(de)
            depthMin = Math.min(depthMin, de)
            depthMax = Math.max(depthMax, de)
        }
    })

    //depths
    let depths = map(rows, 'depth')
    depths = map(depths, cdbl)
    // console.log('depths', depths)

    //sts
    let sts = []

    //sts for parms
    if (true) {
        each(ks, (k) => {

            //key
            let key = ''
            if (!isestr(key) && haskey(kpCvKey, k)) {
                key = get(kpCvKey, k, '')
            }
            if (!isestr(key)) {
                key = k
            }

            //valueTitle
            let valueTitle = ''
            if (!isestr(valueTitle) && haskey(kpCvKey, k)) {
                valueTitle = get(kpCvKey, k, '')
            }
            if (!isestr(valueTitle) && k.indexOf('-CRR') >= 0) {
                valueTitle = 'CRR'
            }
            if (!isestr(valueTitle) && k.indexOf('-CSR') >= 0) {
                valueTitle = 'CSR'
            }
            if (!isestr(valueTitle) && k.indexOf('-FS') >= 0) {
                valueTitle = 'FS'
            }
            if (!isestr(valueTitle) && k.indexOf('-PL') >= 0) {
                valueTitle = 'PL'
            }
            if (!isestr(valueTitle) && k.indexOf('-stl') >= 0) {
                valueTitle = 'Settlement(m)'
            }
            if (!isestr(valueTitle) && k.indexOf('-vstr') >= 0) {
                valueTitle = 'Vol. strain(%)'
            }
            if (!isestr(valueTitle)) {
                valueTitle = k
            }

            //params
            let params = map(rows, k)
            params = map(params, (p) => {
                if (isnum(p)) {
                    p = cdbl(p)
                }
                else {
                    p = null //非數字則使用null, 使highcharts能略過繪圖點
                }
                return p
            })
            // console.log(k, 'params', params)

            //check
            let b = false
            each(params, (p) => {
                if (isNumber(p)) {
                    b = true
                    return false //跳出
                }
            })
            if (!b) {
                return true //跳出換下一個
            }

            //cvRowsToStsParam
            let st = cvRowsToStsParam(key, valueTitle, depthTitle, depthMin, depthMax, depths, params)
            // console.log(k, 'st', st)

            //push
            sts.push(st)

        })
    }

    //sts for cmpFS
    if (true) {

        //cvRowsToStsCmpFS
        let st = cvRowsToStsCmpFS(rows, depthTitle, depthMin, depthMax, depths)
        // console.log('st', st)

        //push
        sts.push(st)

    }

    //sts for Geolayer
    if (true) {

        //cvRowsToStsGeolayer
        let st = cvRowsToStsGeolayer(rows, depthTitle, geolayerWidth, geolayerWaterLevel)
        // console.log('st', st)

        //插入最前面
        sts = [
            st,
            ...sts,
        ]

    }

    return sts
}


function anaSptLiq(rowsIn, opt = {}) {

    //kpHead
    let kpHead = get(opt, 'kpHead', {})

    //depthTitle
    let depthTitle = get(opt, 'depthTitle', 'Depth(m)')

    //geolayerWidth
    let geolayerWidth = get(opt, 'geolayerWidth', 240)

    //geolayerWaterLevel
    let geolayerWaterLevel = get(opt, 'geolayerWaterLevel', 0)

    //rowsOut
    let rowsOut = calcLiquefaction.calc('SPT', rowsIn, opt)
    // console.log('rowsOut', cloneDeep(rowsOut))

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
            // kpHeadHide: {
            //     id: true,
            //     mappingId: true,
            //     isActive: true,
            // },
            // kpCellAlighH: {
            //     id: 'left',
            // },
            // kpHeadWidth: {
            //     depthStart: 110,
            //     depthEnd: 110,
            //     depth: 110,
            // },
            // kpHeadFixLeft: {
            //     depthStart: true,
            //     depthEnd: true,
            //     //depth: true,
            // },
            // kpCellEditable: {
            //     depth: false,
            //     FC: false,
            //     rd: false,
            //     rsat: false,
            //     sv: false,
            //     svp: false,
            //     svpUsual: false,
            //     svpDesign: false,
            //     // ...ksNotEdit,
            // },
            // kpCellTooltip: {
            //     ...genObj(keys(ksNotEdit), (v) => {
            //         return (v) => {
            //             return v
            //         }
            //     }),
            // },
            kpColStyle: {},
            // kpCellRender: getParamRender(),
            // cellChange: (key, row) => {
            //     console.log('cellChange', key, row[key], row)

            //     //clear sv, svp, svpUsual, svpDesign, 因現在calcLiquefaction會有沿用垂直應力與有效應力之機制, 故得先清除才分析
            //     vo.opt.rows = fillRows(vo.opt.rows, 'sv', '')
            //     vo.opt.rows = fillRows(vo.opt.rows, 'svp', '')
            //     vo.opt.rows = fillRows(vo.opt.rows, 'svpUsual', '')
            //     vo.opt.rows = fillRows(vo.opt.rows, 'svpDesign', '')

            //     //fill waterLevel, waterLevelUsual, waterLevelDesign
            //     if (key === 'waterLevel') {
            //         let waterLevel = row[key]
            //         vo.opt.rows = fillRows(vo.opt.rows, 'waterLevel', waterLevel)
            //         vo.opt.rows = fillRows(vo.opt.rows, 'waterLevelUsual', waterLevel)
            //         vo.opt.rows = fillRows(vo.opt.rows, 'waterLevelDesign', waterLevel)
            //     }

            //     //fill Ml
            //     if (key === 'Ml') {
            //         let Ml = row[key]
            //         if (!isnum(Ml)) {
            //             Ml = 0
            //         }
            //         Ml = cdbl(Ml)
            //         let Mw = MlToMw(Ml) //由芮式規模推估
            //         vo.opt.rows = fillRows(vo.opt.rows, 'Ml', Ml)
            //         vo.opt.rows = fillRows(vo.opt.rows, 'Mw', Mw)
            //     }

            //     //fill Mw, PGA, vibrationType
            //     if (arrHas(key, ['Mw', 'PGA', 'vibrationType'])) {
            //         vo.opt.rows = fillRows(vo.opt.rows, key, row[key])
            //     }

            //     //calcLiquefaction
            //     console.log('cellChange: calcLiquefaction before', cloneDeep(vo.opt.rows))
            //     vo.opt.rows = calcLiquefaction.calc(vo.kind, vo.opt.rows)
            //     console.log('cellChange: calcLiquefaction after', cloneDeep(vo.opt.rows))

            // },
        }
    }

    //sts
    let sts = []
    if (true) {
        let keysDel
        let rowsTemp = cloneDeep(rowsOut)

        keysDel = ['waterLevelUsual', 'waterLevelDesign', 'PGA', 'Ml', 'Mw', 'vibrationType']
        rowsTemp = map(rowsTemp, (row) => {
            each(keysDel, (k) => {
                delete row[k]
            })
            return row
        })
        // console.log('rowsTemp', rowsTemp)

        keysDel = ['-H1', '-rrd', '-N160', '-N160cs', '-N172', '-N172cs', '-cFC', '-Na', '-Rl', '-ks', '-cw', '-c1', '-c2', '-CN', '-RL', '-alpha', '-beta', '-dNf', '-CRR75']
        rowsTemp = map(rowsTemp, (row) => {
            each(row, (r, kr) => {
                each(keysDel, (k) => {
                    if (kr.indexOf(k) >= 0) {
                        delete row[kr]
                    }
                })
            })
            return row
        })
        // console.log('rowsTemp', rowsTemp)

        //cvRowsToSts
        sts = cvRowsToSts(rowsTemp, kpHead, depthTitle, geolayerWidth, geolayerWaterLevel)
        // console.log('sts', sts)

    }

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
                    'depthStart': 'depthhStart(m)',
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
        geolayerWidth: {
            type: Number,
            default: 240,
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
        optionsTable: {
            type: Object,
            default: () => {},
        },
        optionsToolPlot: {
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
                depthTitle: vo.depthTitle,
                geolayerWidth: vo.geolayerWidth,
                geolayerWaterLevel: waterLevel, //由rows[0]取得
            }

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
