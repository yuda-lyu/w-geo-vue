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

        <!-- 分析拋出例外時顯示錯誤訊息(同時發出error事件), 取代整區空白 -->
        <div
            style="padding-bottom:30px;"
            role="alert"
            v-if="hasErr"
        >
            <div style="display:flex; align-items:center;">
                <div style="padding-top:2px;">
                    <WIcon
                        :icon="mdiAlertCircleOutline"
                        :size="24"
                        :color="'#f26'"
                        :colorHover="'#f26'"
                    ></WIcon>
                </div>
                <div style="padding-left:7px; font-size:0.85rem; color:#f26; word-break:break-word;">
                    {{errMsg}}
                </div>
            </div>
        </div>

        <div
            :style="``"
            v-if="hasSelects && !hasErr"
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
                <!-- 欄名(含上下標)、數值取位、-err與-stateFS欄提示皆經slot客製(w-aggrid-vue 2.0.56起已移除opt.kpHeadRender等舊鍵), slot由WTableEdit轉發 -->
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
                >
                    <template v-slot:head-render="props">
                        <span v-if="hasHeadHtml(props.key)" v-html="props.value"></span>
                        <span v-else>{{props.value}}</span>
                    </template>
                    <template v-slot:cell-render="props">
                        <span v-html="getCellHtml(props.key, props.value)"></span>
                    </template>
                    <template v-slot:cell-tooltip="props">
                        <div v-if="hasCellTooltip(props.key)" v-html="getCellHtml(props.key, props.value)"></div>
                    </template>
                </WTableEdit>
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
import { mdiBookOpenPageVariantOutline, mdiFileTableBoxOutline, mdiAlertCircleOutline } from '@mdi/js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WCheckbox from 'w-component-vue/src/components/WCheckbox.vue'
import WTableEdit from 'w-table-vue/src/components/WTableEdit.vue'
import WSptLiqPlotDepthsWithGradesAndTools from './WSptLiqPlotDepthsWithGradesAndTools.vue'
import spc2html from '../js/spc2html.mjs'
import getCellText from '../js/getCellText.mjs'
import getIdig from '../js/getIdig.mjs'
import getKeyStsSelects from '../js/getKeyStsSelects.mjs'
import anaSptLiq, { isLongTextKey } from '../js/anaSptLiq.mjs'


/**
 * 提供SPT液化分析之整合組件，含分析方法勾選區、分析結果數據表格(WTableEdit)，以及分析結果之深度剖線繪圖區(WSptLiqPlotDepthsWithGradesAndTools)
 *
 * 內部先依kpTransRowKey轉換rows各欄位key，再以w-geo之calcLiquefaction計算液化分析，並由計算結果產生表格設定與各參數繪圖狀態物件。地下水位取自rows第1筆之waterLevel、waterLevelUsual、waterLevelDesign(依序覆蓋)
 *
 * 表格為唯讀不提供編輯，計算結果中key含'-err'與'-stateFS'者會自動轉換角括號為HTML實體字元並開啟儲存格提示框
 *
 * 表格之欄名(依kpHead顯示上下標)、儲存格(依kpDig取位)與提示框皆經WTableEdit之slot(head-render、cell-render、cell-tooltip)實作，不再使用w-aggrid-vue 2.0.56起已移除之kpHeadRender、kpCellRender、kpCellTooltip設定
 *
 * 計算結果中來源為文字之數值欄會於顯示文字不變之前提下轉為數值並使用數值過濾器，其餘有值之欄使用文字過濾器；數值過濾比對原值而非依kpDig取位後之顯示值(例如顯示15.275之原值15.274999999999999以15.275過濾不中)
 *
 * 儲存格值以HTML解析呈現(同既有語意)，rows不得含未經處理之不可信文字；'-err'與'-stateFS'欄之值為HTML實體字串，匯出值與rows插槽亦為實體字串，文字過濾須以實體字串比對
 *
 * 分析(含w-geo計算)拋出例外時，不顯示表格與繪圖並於組件內顯示錯誤訊息，同時發出error事件；輸入rows為空時視為尚無數據，不計算亦不視為錯誤
 *
 * 繪圖參數之勾選：首次分析結果與日後新勾選之液化分析方法，其符合keyParamSelects之參數(-FS、-cmpFS、-PL、-stlTS、-stlIY等)自動勾選並繪圖；取消勾選方法時其參數與圖移除，再次勾選時重新自動勾選；已存在參數之勾選結果維持使用者之選擇，不因分析結果更新而改變
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
 * @vue-prop {Array} [keyParamSelects] 輸入預設勾選繪圖參數之過濾設定物件陣列，套用於首次出現與日後新出現之參數(例如新勾選液化分析方法後其-FS、-PL、-stlTS、-stlIY等)，已出現參數之勾選結果不因此改變，物件可給予keyFull(需完全相同)或keyPart(需部份含有)，預設已提供Geolayer、N60、FC(%)、-FS、-cmpFS、-PL、-stl等過濾
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
 * @vue-data {Object} optTable 儲存供WTableEdit使用之表格設定物件，其列為已將文字數值欄轉為數值之列
 * @vue-data {Array} rowsAna 儲存液化分析結果之數據物件陣列(未轉型，供rowsResult與zone-top插槽使用)
 * @vue-data {Array} sts 儲存分析結果各參數之繪圖狀態物件陣列
 * @vue-data {Array} stsKeysPrev 儲存前次處理時分析結果各參數之key字串陣列，供判斷新出現與已消失之參數
 * @vue-data {Array} keyStsSelects 儲存已勾選繪製參數之key字串陣列，新勾選液化分析方法時其符合keyParamSelects之參數會自動加入，取消勾選時其參數自此移除
 * @vue-data {String} errMsg 儲存分析拋出例外之錯誤訊息字串，無錯誤時為空字串
 * @vue-computed {String} textMethods 回傳分析方法勾選區標題字串
 * @vue-computed {String} textTable 回傳數據表格區標題字串
 * @vue-computed {Boolean} hasSelects 回傳是否已勾選液化分析方法布林值
 * @vue-computed {Boolean} hasSts 回傳是否已有繪圖狀態物件布林值
 * @vue-computed {Boolean} hasErr 回傳分析是否拋出例外而有錯誤訊息布林值
 * @vue-computed {Object} useKpHead 回傳已取代應力單位與轉換上下標語法之欄位標題對照物件
 * @vue-computed {Array} rowsResult 回傳液化分析結果之數據物件陣列(各欄值型別同w-geo計算結果，不受表格數值欄轉型影響)
 * @vue-computed {Object} row0Result 回傳液化分析結果第1筆數據物件
 * @vue-computed {Object} rowNResult 回傳液化分析結果最末筆數據物件
 * @vue-event {Array} update:sptMethodsSelects 當使用者勾選或取消液化分析方法時，回傳已勾選方法之字串陣列
 * @vue-event {Error} error 當分析(含w-geo計算)拋出例外時，回傳該例外物件(例如rows[0].PGA為空時之'rows[0].PGA or opt.PGA is not a number')，每次分析失敗皆發出一次
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
            mdiAlertCircleOutline,

            // dbc: debounce(),

            sptMethodsSelectsTrans: this.sptMethodsSelects, //以prop為初值, 使首次渲染時之分析即用實際勾選之方法, 不先以空陣列分析一次再重算(分析失敗時會重複發出error事件)
            kpMehtodSelect: {},

            heightTable: 400,

            rowsTrans: [],

            optTable: {},

            rowsAna: [],

            sts: [],
            stsKeysPrev: [],
            keyStsSelects: [],

            errMsg: '',

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

            //check, 未勾選任何分析方法時w-geo會以全部方法計算(結果不顯示), 不依其結果判斷參數之新出現; 勾選與前次鍵集一併清空, 再勾選方法時視為首次出現而重新自動勾選
            if (!vo.hasSelects) {
                if (size(vo.keyStsSelects) > 0) {
                    vo.keyStsSelects = []
                }
                if (size(vo.stsKeysPrev) > 0) {
                    vo.stsKeysPrev = []
                }
                return ''
            }

            //getKeyStsSelects, 新出現之參數(首次分析結果與新勾選方法之-FS,-PL,-stl等)依keyParamSelects自動勾選, 已消失者(取消勾選方法)移除, 其餘維持使用者之勾選結果
            let r = getKeyStsSelects(map(vo.sts, 'key'), vo.stsKeysPrev, vo.keyStsSelects, vo.keyParamSelects)
            // console.log('getKeyStsSelects', r)

            //update, 參照不變(無變更)則不寫回, 避免此computed因自身依賴被寫入而重複觸發
            if (r.keysPrev !== vo.stsKeysPrev) {
                vo.stsKeysPrev = r.keysPrev
            }
            if (r.keyStsSelects !== vo.keyStsSelects) {
                vo.keyStsSelects = r.keyStsSelects
            }

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

        hasErr: function() {
            let vo = this
            let b = vo.errMsg !== ''
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
            return vo.rowsAna
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

            //core
            try {
                vo.analysisCore()
            }
            catch (err) {

                //分析(含w-geo計算)拋出例外, 清除舊結果, 改於組件內顯示錯誤訊息, 並發出error事件供使用端處理
                vo.optTable = {}
                vo.rowsAna = []
                vo.sts = []
                vo.errMsg = cstr(get(err, 'message', '')) || cstr(err) || 'Error'

                //emit, 於nextTick發出, 避免在computed(渲染期間)內同步觸發使用端handler, 元件已銷毀則不再發出
                vo.$nextTick(() => {
                    if (vo._isDestroyed || vo._isBeingDestroyed) {
                        return
                    }
                    vo.$emit('error', err)
                })

            }

        },

        analysisCore: function() {
            let vo = this

            let rowsIn = vo.rowsTrans
            // console.log('rowsIn', cloneDeep(rowsIn))

            //無數據(使用端資料載入前之常態)不算錯誤, 不進行計算
            if (size(rowsIn) === 0) {
                vo.optTable = {}
                vo.rowsAna = []
                vo.sts = []
                vo.errMsg = ''
                return
            }

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
            vo.rowsAna = r.rows
            vo.sts = r.sts
            vo.errMsg = ''

        },

        hasHeadHtml: function(k) {
            let vo = this

            //僅kpHead有給予標題之欄位其標題含上下標等html語法, 無對應者表頭為欄位鍵字面, 以文字呈現(同修正前未經kpHeadRender之預設表頭)
            return Object.prototype.hasOwnProperty.call(vo.useKpHead, k)
        },

        hasCellTooltip: function(k) {
            return isLongTextKey(k)
        },

        getCellHtml: function(k, v) {
            let vo = this

            //idig, kpDig內有給予該欄位小數位數時取位
            let idig = getIdig(vo.kpDig, k)

            //getCellText, 輸出供v-html使用, -err與-stateFS欄之值已於分析時escapeHTML, 故顯示為原字元
            return getCellText(v, idig)
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
