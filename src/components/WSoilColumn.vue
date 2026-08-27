<template>
    <WSegmentsVertical
        v-bind="optionsSegmentsEff"
        :items="useItems"
        :width="width"
        :height="height"
        :paddingStyle="paddingStyle"
        :keyValueStart="keyDepthStart"
        :keyValueEnd="keyDepthEnd"
        :keyText="keyText"
        :valueMin="depthMinEff"
        :valueMax="depthMaxEff"
        :title="title"
        :tickSize="tickSize"
        :segmentSize="segmentSize"
        :segmentWithPopup="layerWithPopup"
        :segmentCanClick="layerCanClick"
        :funSegmentBackgroundImage="getSegmentBackgroundIcon"
        :funFormatTickValue="getTickValue"
        @click-segment="clickLayer"
    >

        <!-- 各slot透傳: 外部未給予時slot內容為空, WSegmentsVertical會改用其自身之預設內容(如text之預設文字區) -->
        <template v-slot:text="props">
            <slot name="text" :item="props.item" :index="props.index"></slot>
        </template>

        <template v-slot:segment-popup="props">
            <slot name="popup" :item="props.item" :index="props.index"></slot>
        </template>

        <template v-slot:support-left="props">
            <slot name="support-left" :convertValueToY="props.convertValueToY"></slot>
        </template>

        <template v-slot:support-right="props">
            <slot name="support-right" :convertValueToY="props.convertValueToY"></slot>
        </template>

    </WSegmentsVertical>
</template>

<script>
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import trim from 'lodash-es/trim.js'
import filter from 'lodash-es/filter.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import iseobj from 'wsemi/src/iseobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import dig from 'wsemi/src/dig.mjs'
import WSegmentsVertical from 'w-component-vue/src/components/WSegmentsVertical.vue'
import getSoilCodeIcon from '../js/getSoilCodeIcon.mjs'


/**
 * 以WSegmentsVertical繪製隨深度之土柱圖，各土層依土壤圖例代碼(legendCode)顯示對應土壤圖示，為WSoilColumnWithAnchors與WSptLiqPlotDepths共用之土柱圖核心
 *
 * 深度方向約定：組件內部一律往下為正(地表為0、地下大於0)，傳入之土層深度(keyDepthStart/keyDepthEnd)須依此預先處理好正負號，刻度顯示符號另由tickDownPositive控制，僅影響刻度顯示文字不影響任何計算
 *
 * 土壤圖示內建於套件(src/js/getSoilCodeIcon.mjs，取自w-demores)，不依賴網路載入，可支援無連外網路之環境；若需自訂圖示可由kpIcon給予
 *
 * 具名插槽(slot)：'text'為土層右側描述文字區塊，提供作用域參數item與index，未給予時使用WSegmentsVertical之預設文字區(三角+keyText文字)；'popup'為土層彈窗內容區塊，提供作用域參數item與index；'support-left'與'support-right'為繪圖區左右側之附加內容區塊，提供作用域參數convertValueToY，為深度轉繪圖區y座標之函數，供外部定位水位等標記
 *
 * @vue-prop {Array} [items=[]] 輸入土層項目物件陣列，各項目至少含keyDepthStart與keyDepthEnd兩數字欄位(往下為正)，並以keyLegendCode欄位對應土壤圖示，其餘欄位原樣供popup插槽使用，預設[]
 * @vue-prop {String} [keyDepthStart='depthStart'] 輸入土層項目存放起始深度之欄位字串，預設'depthStart'
 * @vue-prop {String} [keyDepthEnd='depthEnd'] 輸入土層項目存放結束深度之欄位字串，預設'depthEnd'
 * @vue-prop {String} [keyText='description'] 輸入土層項目存放說明文字之欄位字串，預設'description'
 * @vue-prop {String} [keyLegendCode='legendCode'] 輸入土層項目存放土壤圖例代碼之欄位字串，供對應土壤圖示，預設'legendCode'
 * @vue-prop {Boolean} [mergeSameLayers=false] 輸入是否合併相鄰且圖例代碼與說明文字皆相同土層布林值，預設false
 * @vue-prop {Object} [kpIcon=null] 輸入土壤圖例代碼對應土壤圖示物件，key為圖例代碼字串，值為圖片data URI或網址字串，給予null時使用內建之getSoilCodeIcon，預設null
 * @vue-prop {Number} [width=191] 輸入土柱繪圖寬度數字，單位px，預設191
 * @vue-prop {Number} [height=504] 輸入土柱繪圖高度數字，單位px，預設504
 * @vue-prop {Object} [paddingStyle={top:10,right:0,bottom:10,left:60}] 輸入內距物件，可用鍵值為top、right、bottom、left，各為數字，單位px，left須容納深度刻度文字，預設{top:10,right:0,bottom:10,left:60}
 * @vue-prop {Number} [depthMin=null] 輸入深度軸最小值數字，給予null時自items自動計算，無items時為0，預設null
 * @vue-prop {Number} [depthMax=null] 輸入深度軸最大值數字，給予null時自items自動計算，無items時為12，預設null
 * @vue-prop {String} [title=''] 輸入深度軸標題字串，給予空字串時不顯示，預設''
 * @vue-prop {Number} [tickSize=25] 輸入深度刻度尺寸(為單側寬度)數字，刻度文字位於刻度左側，故須大於等於segmentSize文字才不會與土柱重疊，單位px，預設25
 * @vue-prop {Number} [segmentSize=20] 輸入土柱區塊尺寸(為單側寬度)數字，單位px，預設20
 * @vue-prop {Boolean} [tickDownPositive=true] 輸入深度刻度顯示符號布林值，true代表往下顯示為正(原值)，false代表往下顯示為負(深度0不加負號)，僅影響顯示不影響計算，預設true
 * @vue-prop {Number} [tickDigits=1] 輸入深度刻度文字取用小數點位數數字，預設1
 * @vue-prop {Function} [funFormatTickValue=null] 輸入處理深度刻度值用以顯示函數，給予時取代內建格式化(tickDownPositive與tickDigits失效)，預設null
 * @vue-prop {Boolean} [layerWithPopup=false] 輸入土層是否可點擊顯示popup彈窗布林值，彈窗內容由slot之popup提供，預設false
 * @vue-prop {Boolean} [layerCanClick=false] 輸入土層是否可點擊布林值，可點擊時發出click-layer事件，預設false
 * @vue-prop {Object} [optionsSegments={}] 輸入向下傳遞至WSegmentsVertical之設定物件，鍵值同WSegmentsVertical之props(如tickColor、axisColor、segmentBorderColor、textShift、segmentBackgroundType等)，惟組件已顯式綁定之props(items、width、height、paddingStyle、keyValueStart、keyValueEnd、keyText、valueMin、valueMax、title、tickSize、segmentSize、segmentWithPopup、segmentCanClick、funSegmentBackgroundImage、funFormatTickValue)以組件為準不可覆蓋；另內建預設segmentBackgroundType為'image'、tickColor為'#444'、axisColor為'transparent'、segmentBorderColor為{v:'transparent',h:'#444'}、alignEnd為'left'，皆可由本物件覆蓋，預設{}
 * @vue-computed {Object} kpIconEff 回傳實際使用之土壤圖示物件，優先取用kpIcon，否則為內建圖示
 * @vue-computed {Array} useItems 回傳實際供繪製之土層項目陣列，已依mergeSameLayers合併相鄰同層
 * @vue-computed {Number} depthMinEff 回傳實際使用之深度軸最小值數字
 * @vue-computed {Number} depthMaxEff 回傳實際使用之深度軸最大值數字
 * @vue-computed {Object} optionsSegmentsEff 回傳實際向下傳遞至WSegmentsVertical之設定物件，已套用內建預設
 * @vue-event {Object} click-layer 當layerCanClick為true且使用者點擊土層時，回傳{ev,item}物件，item為該土層物件
 */
export default {
    components: {
        WSegmentsVertical,
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        keyDepthStart: {
            type: String,
            default: 'depthStart',
        },
        keyDepthEnd: {
            type: String,
            default: 'depthEnd',
        },
        keyText: {
            type: String,
            default: 'description',
        },
        keyLegendCode: {
            type: String,
            default: 'legendCode',
        },
        mergeSameLayers: {
            type: Boolean,
            default: false,
        },
        kpIcon: {
            type: Object,
            default: null,
        },
        width: {
            type: Number,
            default: 191,
        },
        height: {
            type: Number,
            default: 504,
        },
        paddingStyle: {
            type: Object,
            default: () => ({ top: 10, right: 0, bottom: 10, left: 60 }),
        },
        depthMin: {
            type: Number,
            default: null,
        },
        depthMax: {
            type: Number,
            default: null,
        },
        title: {
            type: String,
            default: '',
        },
        tickSize: {
            type: Number,
            default: 25,
        },
        segmentSize: {
            type: Number,
            default: 20,
        },
        tickDownPositive: {
            type: Boolean,
            default: true,
        },
        tickDigits: {
            type: Number,
            default: 1,
        },
        funFormatTickValue: {
            type: Function,
            default: null,
        },
        layerWithPopup: {
            type: Boolean,
            default: false,
        },
        layerCanClick: {
            type: Boolean,
            default: false,
        },
        optionsSegments: {
            type: Object,
            default: () => ({}),
        },
    },
    data: function() {
        return {
        }
    },
    computed: {

        kpIconEff: function() {
            let vo = this
            if (iseobj(vo.kpIcon)) {
                return vo.kpIcon
            }
            return getSoilCodeIcon()
        },

        useItems: function() {
            let vo = this
            let items = vo.items
            if (vo.mergeSameLayers) {
                items = vo.mergeSameLegendCodeAndText(items)
            }
            return items
        },

        depthMinEff: function() {
            let vo = this
            if (isnum(vo.depthMin)) {
                return cdbl(vo.depthMin)
            }
            let ds = filter(map(vo.items, vo.keyDepthStart), isnum)
            if (ds.length > 0) {
                return Math.min(...map(ds, cdbl))
            }
            return 0
        },

        depthMaxEff: function() {
            let vo = this
            if (isnum(vo.depthMax)) {
                return cdbl(vo.depthMax)
            }
            let ds = filter(map(vo.items, vo.keyDepthEnd), isnum)
            if (ds.length > 0) {
                return Math.max(...map(ds, cdbl))
            }
            return 12
        },

        //alignEnd預設'left': WSegmentsVertical預設'right'會使結束深度刻度文字落於軸右側而被土柱遮蔽
        optionsSegmentsEff: function() {
            let vo = this
            return {
                segmentBackgroundType: 'image',
                tickColor: '#444',
                axisColor: 'transparent',
                segmentBorderColor: { v: 'transparent', h: '#444' },
                alignEnd: 'left',
                ...vo.optionsSegments,
            }
        },

    },
    methods: {

        getSegmentBackgroundIcon: function(item) {
            let vo = this
            let legendCode = get(item, vo.keyLegendCode, '')
            let bgicon = get(vo.kpIconEff, legendCode, '')
            return bgicon
        },

        //深度刻度顯示: tickDownPositive=false時轉為朝下為負(深度0不加負號); 僅為顯示格式, 深度軸計算仍用原始正值
        getTickValue: function(v) {
            let vo = this
            if (isfun(vo.funFormatTickValue)) {
                return vo.funFormatTickValue(v)
            }
            let n = cdbl(v)
            if (!vo.tickDownPositive && n !== 0) {
                n = -n
            }
            return dig(n, vo.tickDigits)
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
                let b1 = v0[vo.keyLegendCode] === v1[vo.keyLegendCode]
                let b2 = trim(v0[vo.keyText]) === trim(v1[vo.keyText]) //土壤描述也要相同才合併
                let b = b1 && b2
                if (b) {
                    itemsTemp[k1][vo.keyDepthStart] = v0[vo.keyDepthStart] //使用前一層depthStart
                    itemsTemp[k0] = null
                }
            })
            itemsTemp = filter(itemsTemp, iseobj)
            return itemsTemp
        },

        clickLayer: function(msg) {
            let vo = this
            vo.$emit('click-layer', msg)
        },

    },
}
</script>

<style scoped>
</style>
