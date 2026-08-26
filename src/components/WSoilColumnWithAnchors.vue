<template>
    <div class="wsca" :style="`position:relative; width:100%; height:${height}px;`">

        <!-- 地表線: 分隔上方地表指標區塊與下方土柱區; 僅自土柱右緣延伸至容器右界(左側深度0刻度字即表達地表, 全寬會使該字被線橫穿) -->
        <div class="wscaGround" :style="`top:${groundY}px; left:${colRight}px; border-top:${groundWidth}px solid ${groundColor};`"></div>

        <!-- 土柱圖: 深度軸與指標區塊之d2y同軸(paddingStyle.top=groundY、bottom=paddingBottom), 指標區塊方能與土層層位精確對齊;
             valueMin/Max一律顯式傳入使土柱值域與d2y同源(組件內自算恐與外部fallback值域不一致) -->
        <WSoilColumn
            v-bind="optionsColumn"
            :items="items"
            :keyDepthStart="keyDepthStart"
            :keyDepthEnd="keyDepthEnd"
            :width="width"
            :height="height"
            :paddingStyle="paddingStyle"
            :depthMin="depthMinEff"
            :depthMax="depthMaxEff"
            :tickSize="tickSize"
            :segmentSize="segmentSize"
            :tickDownPositive="tickDownPositive"
            :tickDigits="tickDigits"
            :funFormatTickValue="funFormatTickValue"
            :layerWithPopup="layerWithPopup"
            :layerCanClick="layerCanClick"
            :optionsSegments="optionsSegments"
            @click-layer="clickLayer"
            v-if="items.length>0"
        >

            <!-- 未給layer-text時須渲染空span佔位, 若slot內容為空Vue會改用WSegmentsVertical之預設文字區(三角+文字)而非留空 -->
            <template v-slot:text="props">
                <slot name="layer-text" :item="props.item"><span></span></slot>
            </template>

            <template v-slot:popup="props">
                <slot name="layer-popup" :item="props.item"></slot>
            </template>

        </WSoilColumn>

        <!-- 地表指標區塊列(depth<=0): 錨定於地表線上方(區塊底緣=groundY-8, 8為朝下三角高度使尖端落於地表), 靠右依陣列順序排列 -->
        <div class="wscaSurf" :style="`bottom:${height-groundY+8}px; right:${markerRight}px; gap:${markerGap}px;`">
            <div
                class="wscaMk tipDown"
                :style="getMarkerBoxStyle(m)"
                :title="getMarkerTitle(m)"
                :key="'wscams-'+m.key"
                @click="(ev)=>clickMarker(ev,m)"
                @mouseenter="()=>enterMarker(m)"
                @mouseleave="leaveMarker"
                v-for="m in markersSurf"
            >

                <slot name="marker" :item="m" :state="getMarkerState(m)">
                    <span class="wscaMk1" :style="getMarkerTextStyle(m,'textColor','textFontSize','textFontFamily')">{{m.text}}</span>
                    <span class="wscaMk2" :style="getMarkerTextStyle(m,'subTextColor','subTextFontSize','subTextFontFamily')">{{m.subText}}</span>
                </slot>

            </div>
        </div>

        <!-- 地下指標區塊(depth>0): 置於土柱右側(留8px間隙, 朝左三角寬即該間隙使尖端恰落於土柱右緣), 依深度定位且防重疊 -->
        <div
            class="wscaMk tipLeft"
            :style="`top:${m._y}px; left:${colRight+8}px; transform:translateY(-50%); `+getMarkerBoxStyle(m)"
            :title="getMarkerTitle(m)"
            :key="'wscamd-'+m.key"
            @click="(ev)=>clickMarker(ev,m)"
            @mouseenter="()=>enterMarker(m)"
            @mouseleave="leaveMarker"
            v-for="m in markersDeep"
        >

            <slot name="marker" :item="m" :state="getMarkerState(m)">
                <span class="wscaMk1" :style="getMarkerTextStyle(m,'textColor','textFontSize','textFontFamily')">{{m.text}}</span>
                <span class="wscaMk2" :style="getMarkerTextStyle(m,'subTextColor','subTextFontSize','subTextFontFamily')">{{m.subText}}</span>
            </slot>

        </div>

    </div>
</template>

<script>
import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import get from 'lodash-es/get.js'
import sortBy from 'lodash-es/sortBy.js'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import WSoilColumn from './WSoilColumn.vue'


//指標區塊各狀態樣式預設值: 給值順序為 marker.style > markerStyle(prop) > 此預設
let kpMarkerStyleDef = {
    backgroundColor: { normal: '#fff', hover: '#fff', active: '#e9eff5', deactive: '#fff' },
    borderColor: { normal: '#e0e4e9', hover: '#76828e', active: '#54708c', deactive: '#e0e4e9' },
    borderWidth: { normal: 1, hover: 1, active: 1, deactive: 1 },
    textColor: { normal: '#48535f', hover: '#48535f', active: '#3e5871', deactive: '#48535f' },
    subTextColor: { normal: '#9fa9b3', hover: '#9fa9b3', active: '#9fa9b3', deactive: '#9fa9b3' },
    opacity: { normal: 1, hover: 1, active: 1, deactive: 0.45 },
    textFontSize: '0.78rem',
    subTextFontSize: '0.66rem',
    textFontFamily: '',
    subTextFontFamily: `Consolas, 'Courier New', monospace`,
}


/**
 * 以WSoilColumn繪製隨深度之土柱圖，並於地表上方與土柱右側依深度錨定指標區塊(marker)，地表指標區塊(depth<=0)靠右水平排列，地下指標區塊(depth>0)依深度定位於土柱右側並自動防重疊
 *
 * 土壤圖示為套件內建不依賴網路載入，可由optionsColumn.kpIcon給予自訂圖示物件
 *
 * 深度方向約定：組件內部一律往下為正(地表為0、地下大於0)，傳入之土層深度(keyDepthStart/keyDepthEnd)與指標深度(depth)皆須依此預先處理好正負號，刻度顯示符號另由tickDownPositive控制，僅影響刻度顯示文字不影響任何計算
 *
 * 指標區塊狀態位階：deactive > active > hover > normal，deactive為最高位階，不觸發hover樣式、不發出點擊事件且cursor為default
 *
 * 具名插槽(slot)：'layer-text'為土層右側描述文字區塊，提供作用域參數item，代表該土層物件，未給予時預設為空(關閉WSegmentsVertical之預設描述文字)；'layer-popup'為土層彈窗內容區塊，提供作用域參數item，代表該土層物件；'marker'為指標區塊內容，提供作用域參數item與state，分別代表該指標區塊物件與當前生效狀態，未給予時預設渲染text與subText
 *
 * @vue-prop {Array} [items=[]] 輸入土層項目物件陣列，各項目至少含keyDepthStart與keyDepthEnd兩數字欄位(往下為正)，並以legendCode欄位(可由optionsColumn.keyLegendCode更改)對應土壤圖示，其餘欄位原樣供layer-popup插槽使用，預設[]
 * @vue-prop {String} [keyDepthStart='depthStart'] 輸入土層項目存放起始深度之欄位字串，預設'depthStart'
 * @vue-prop {String} [keyDepthEnd='depthEnd'] 輸入土層項目存放結束深度之欄位字串，預設'depthEnd'
 * @vue-prop {Number} [width=191] 輸入土柱繪圖寬度數字，單位px，組件根元素寬度為100%由外容器決定，預設191
 * @vue-prop {Number} [height=504] 輸入組件高度數字，單位px，預設504
 * @vue-prop {Number} [groundY=90] 輸入地表線y座標數字，其上方為地表指標區塊區，即土柱圖之上方內距，單位px，預設90
 * @vue-prop {Number} [paddingBottom=22] 輸入土柱圖下方內距數字，單位px，預設22
 * @vue-prop {Number} [paddingLeft=60] 輸入土柱圖左方內距數字，用以容納深度刻度文字，單位px，預設60
 * @vue-prop {Number} [tickSize=25] 輸入深度刻度尺寸(為單側寬度)數字，刻度文字位於刻度左側，故須大於等於segmentSize文字才不會與土柱重疊，單位px，預設25
 * @vue-prop {Number} [segmentSize=20] 輸入土柱區塊尺寸(為單側寬度)數字，單位px，預設20
 * @vue-prop {Number} [depthMin=null] 輸入深度軸最小值數字，給予null時自items自動計算，無items時為0，預設null
 * @vue-prop {Number} [depthMax=null] 輸入深度軸最大值數字，給予null時自items自動計算，無items時取地下指標最深處乘1.25，再無則為12，預設null
 * @vue-prop {Boolean} [tickDownPositive=true] 輸入深度刻度顯示符號布林值，true代表往下顯示為正(原值)，false代表往下顯示為負(深度0不加負號)，僅影響顯示不影響計算，預設true
 * @vue-prop {Number} [tickDigits=1] 輸入深度刻度文字取用小數點位數數字，預設1
 * @vue-prop {Function} [funFormatTickValue=null] 輸入處理深度刻度值用以顯示函數，給予時取代內建格式化(tickDownPositive與tickDigits失效)，預設null
 * @vue-prop {String} [groundColor='#7f7a6f'] 輸入地表線顏色字串，預設'#7f7a6f'
 * @vue-prop {Number} [groundWidth=1.6] 輸入地表線寬度數字，單位px，給予0時不顯示，預設1.6
 * @vue-prop {Boolean} [layerWithPopup=false] 輸入土層是否可點擊顯示popup彈窗布林值，彈窗內容由slot之layer-popup提供，預設false
 * @vue-prop {Boolean} [layerCanClick=false] 輸入土層是否可點擊布林值，可點擊時發出click-layer事件，預設false
 * @vue-prop {Object} [optionsColumn={}] 輸入向下傳遞至WSoilColumn之設定物件，可用鍵值為keyText、keyLegendCode、mergeSameLayers、kpIcon、title，說明同WSoilColumn之props，其餘WSoilColumn之props已由組件顯式綁定不可覆蓋，預設{}
 * @vue-prop {Object} [optionsSegments={}] 輸入經WSoilColumn向下傳遞至WSegmentsVertical之設定物件，鍵值同WSegmentsVertical之props(如tickColor、axisColor、segmentBackgroundType等)，內建預設與不可覆蓋項同WSoilColumn之optionsSegments，預設{}
 * @vue-prop {Array} [markers=[]] 輸入指標區塊物件陣列，各項目可用鍵值為key、depth、text、subText、state、title、style，外部變更狀態時傳入新陣列即可更新各區塊樣式，預設[]
 * @vue-prop {String} [markers.key] 輸入指標區塊識別字串，必填且不可重複，預設無
 * @vue-prop {Number} [markers.depth] 輸入指標深度數字，往下為正，小於等於0時為地表區塊，大於0時為地下區塊，預設無
 * @vue-prop {String} [markers.text] 輸入指標區塊主文字字串，預設無
 * @vue-prop {String} [markers.subText] 輸入指標區塊次文字字串，預設無
 * @vue-prop {String} [markers.state='normal'] 輸入指標區塊狀態字串，可選'normal'、'active'、'deactive'，預設'normal'
 * @vue-prop {String} [markers.title] 輸入指標區塊滑鼠懸停提示文字字串，預設無
 * @vue-prop {Object} [markers.style] 輸入指標區塊各狀態樣式覆寫物件，結構同markerStyle，優先於markerStyle，預設無
 * @vue-prop {Object} [markerStyle={}] 輸入指標區塊預設樣式物件，可用鍵值為backgroundColor、borderColor、borderWidth、textColor、subTextColor、opacity(各為{normal,hover,active,deactive}物件)與textFontSize、subTextFontSize、textFontFamily、subTextFontFamily(字串)，未給予部分使用內建預設，預設{}
 * @vue-prop {Number} [markerRight=11] 輸入地表指標區塊列右緣內縮距離數字，單位px，預設11
 * @vue-prop {Number} [markerGap=8] 輸入地表指標區塊間距數字，單位px，預設8
 * @vue-prop {Number} [markerMinSpacing=48] 輸入地下指標區塊防重疊之最小垂直間距數字，單位px，預設48
 * @vue-prop {Number} [surfaceClearance=25] 輸入地下指標區塊與地表線之最小距離數字，單位px，預設25
 * @vue-data {String} hoverKey 儲存當前滑鼠懸停之指標區塊key字串
 * @vue-computed {Number} colRight 回傳土柱右緣x座標數字，為地表線起點與地下指標區塊定位基準，單位px
 * @vue-computed {Object} paddingStyle 回傳向下傳遞至WSoilColumn之內距物件
 * @vue-computed {Number} depthMinEff 回傳實際使用之深度軸最小值數字，顯式傳入WSoilColumn使土柱值域與指標區塊定位同源
 * @vue-computed {Number} depthMaxEff 回傳實際使用之深度軸最大值數字，顯式傳入WSoilColumn使土柱值域與指標區塊定位同源
 * @vue-computed {Array} markersSurf 回傳地表指標區塊(depth<=0)物件陣列
 * @vue-computed {Array} markersDeep 回傳地下指標區塊(depth>0)物件陣列，已依深度排序並計算防重疊後之y座標存於_y
 * @vue-event {Object} click-marker 當使用者點擊指標區塊時(state為deactive時不觸發)，回傳{ev,item}物件，item為該指標區塊物件
 * @vue-event {Object} click-layer 當layerCanClick為true且使用者點擊土層時，回傳{ev,item}物件，item為該土層物件
 */
export default {
    components: {
        WSoilColumn,
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
        width: {
            type: Number,
            default: 191,
        },
        height: {
            type: Number,
            default: 504,
        },
        groundY: {
            type: Number,
            default: 90,
        },
        paddingBottom: {
            type: Number,
            default: 22,
        },
        paddingLeft: {
            type: Number,
            default: 60,
        },
        tickSize: {
            type: Number,
            default: 25,
        },
        segmentSize: {
            type: Number,
            default: 20,
        },
        depthMin: {
            type: Number,
            default: null,
        },
        depthMax: {
            type: Number,
            default: null,
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
        groundColor: {
            type: String,
            default: '#7f7a6f',
        },
        groundWidth: {
            type: Number,
            default: 1.6,
        },
        layerWithPopup: {
            type: Boolean,
            default: false,
        },
        layerCanClick: {
            type: Boolean,
            default: false,
        },
        optionsColumn: {
            type: Object,
            default: () => ({}),
        },
        optionsSegments: {
            type: Object,
            default: () => ({}),
        },
        markers: {
            type: Array,
            default: () => [],
        },
        markerStyle: {
            type: Object,
            default: () => ({}),
        },
        markerRight: {
            type: Number,
            default: 11,
        },
        markerGap: {
            type: Number,
            default: 8,
        },
        markerMinSpacing: {
            type: Number,
            default: 48,
        },
        surfaceClearance: {
            type: Number,
            default: 25,
        },
    },
    data: function() {
        return {
            hoverKey: '',
        }
    },
    computed: {

        colRight: function() {
            let vo = this
            return vo.paddingLeft + vo.segmentSize
        },

        paddingStyle: function() {
            let vo = this
            return {
                top: vo.groundY,
                right: 0,
                bottom: vo.paddingBottom,
                left: vo.paddingLeft,
            }
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
            //無土層數據時回退為地下指標最深處放大1.25倍
            let dm = filter(map(vo.markers, 'depth'), (d) => {
                return isnum(d) && cdbl(d) > 0
            })
            return dm.length > 0 ? Math.max(...map(dm, cdbl)) * 1.25 : 12
        },

        //地表指標區塊(depth<=0): 以flex排列故不需計算x座標
        markersSurf: function() {
            let vo = this
            return filter(vo.markers, (m) => {
                return !(isnum(get(m, 'depth')) && cdbl(get(m, 'depth')) > 0)
            })
        },

        //地下指標區塊(depth>0): 依深度排序後計算y座標, 依序防重疊(各區塊不高於前一區塊+markerMinSpacing, 且不高於地表線+surfaceClearance)
        markersDeep: function() {
            let vo = this
            let ms = filter(vo.markers, (m) => {
                return isnum(get(m, 'depth')) && cdbl(get(m, 'depth')) > 0
            })
            ms = sortBy(ms, (m) => {
                return cdbl(m.depth)
            })
            let prevY = null
            return map(ms, (m) => {
                let y = Math.max(vo.d2y(cdbl(m.depth)), vo.groundY + vo.surfaceClearance)
                if (prevY !== null) {
                    y = Math.max(y, prevY + vo.markerMinSpacing)
                }
                prevY = y
                return { ...m, _y: y }
            })
        },

    },
    methods: {

        //深度轉y座標: 與土柱圖同一深度軸(plot區起於paddingTop=groundY、高height-groundY-paddingBottom, 值域depthMinEff~depthMaxEff)
        d2y: function(d) {
            let vo = this
            let range = vo.depthMaxEff - vo.depthMinEff
            if (!(range > 0)) {
                return vo.groundY
            }
            return vo.groundY + ((d - vo.depthMinEff) / range) * (vo.height - vo.paddingBottom - vo.groundY)
        },

        //指標區塊當前生效狀態: 位階deactive > active > hover > normal, deactive時不受hover影響
        getMarkerState: function(m) {
            let vo = this
            let st = get(m, 'state', 'normal')
            if (st === 'deactive') {
                return 'deactive'
            }
            if (st === 'active') {
                return 'active'
            }
            if (vo.hoverKey === get(m, 'key', '')) {
                return 'hover'
            }
            return 'normal'
        },

        //樣式取值: marker.style > markerStyle(prop) > 內建預設
        getMarkerStyleValue: function(m, field, stk) {
            let vo = this
            let p = stk === null ? field : `${field}.${stk}`
            let v = get(m, `style.${p}`, null)
            if (v === null) {
                v = get(vo.markerStyle, p, null)
            }
            if (v === null) {
                v = get(kpMarkerStyleDef, p, null)
            }
            return v
        },

        //區塊盒樣式: 三角指標色(--tipBd/--tipBg)隨當前生效狀態之框線/背景色連動
        getMarkerBoxStyle: function(m) {
            let vo = this
            let stk = vo.getMarkerState(m)
            let bg = vo.getMarkerStyleValue(m, 'backgroundColor', stk)
            let bc = vo.getMarkerStyleValue(m, 'borderColor', stk)
            let bw = vo.getMarkerStyleValue(m, 'borderWidth', stk)
            let op = vo.getMarkerStyleValue(m, 'opacity', stk)
            let cursor = stk === 'deactive' ? 'default' : 'pointer'
            return `background:${bg}; border:${bw}px solid ${bc}; opacity:${op}; cursor:${cursor}; --tipBd:${bc}; --tipBg:${bg};`
        },

        getMarkerTextStyle: function(m, fieldColor, fieldSize, fieldFamily) {
            let vo = this
            let stk = vo.getMarkerState(m)
            let c = vo.getMarkerStyleValue(m, fieldColor, stk)
            let fs = vo.getMarkerStyleValue(m, fieldSize, null)
            let ff = vo.getMarkerStyleValue(m, fieldFamily, null)
            let r = `color:${c}; font-size:${fs};`
            if (ff) {
                r += ` font-family:${ff};`
            }
            return r
        },

        getMarkerTitle: function(m) {
            return get(m, 'title', '')
        },

        clickMarker: function(ev, m) {
            let vo = this

            //check, deactive為最高位階不觸發點擊事件
            if (vo.getMarkerState(m) === 'deactive') {
                return
            }

            vo.$emit('click-marker', { ev, item: m })
        },

        enterMarker: function(m) {
            let vo = this
            vo.hoverKey = get(m, 'key', '')
        },

        leaveMarker: function() {
            let vo = this
            vo.hoverKey = ''
        },

        clickLayer: function(msg) {
            let vo = this
            vo.$emit('click-layer', msg)
        },

    },
}
</script>

<style scoped>
.wscaGround {
    position: absolute;
    right: 0;
    height: 0;
    pointer-events: none;
}
.wscaSurf {
    position: absolute;
    display: flex;
}
.wscaMk {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 8px;
    padding: 4px 11px;
    user-select: none;
    transition: all 0.15s;
    min-width: 66px;
    position: relative;
}
.wscaMk.tipLeft {
    position: absolute;
}
.wscaMk1 {
    font-weight: 700;
    white-space: nowrap;
}
.wscaMk2 {
    white-space: nowrap;
}
/* 區塊之三角指標(朝下=地表區塊指向地表, 朝左=地下區塊指向土柱層位): 外層(::before)為邊框色, 內層(::after)為底色並內縮1px,
   使尖角與區塊描邊連續; 色由getMarkerBoxStyle以區域變數(--tipBd/--tipBg)隨狀態連動傳遞 */
.wscaMk.tipDown::before,
.wscaMk.tipDown::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 0;
    height: 0;
}
.wscaMk.tipDown::before {
    top: 100%;
    margin-left: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid var(--tipBd);
}
.wscaMk.tipDown::after {
    top: calc(100% - 1px);
    margin-left: -6px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 7px solid var(--tipBg);
}
/* 朝左三角: 突出8px即區塊左緣至土柱右緣之間隙, 尖端恰落於土柱右緣; 底邊14px與朝下三角同尺寸 */
.wscaMk.tipLeft::before,
.wscaMk.tipLeft::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
}
.wscaMk.tipLeft::before {
    right: 100%;
    margin-top: -7px;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-right: 8px solid var(--tipBd);
}
.wscaMk.tipLeft::after {
    right: calc(100% - 1px);
    margin-top: -6px;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 7px solid var(--tipBg);
}
</style>
