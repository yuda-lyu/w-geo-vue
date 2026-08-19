<template>
    <div :style="``">

        <!-- 預設給予zoneTopHeight與zoneBottomHeight, 若外部有另外給予可覆蓋 -->
        <WSptLiqPlotDepths
            :sts="sts"
            :optionsPic="useOptionsPic"
        >

            <template v-slot:zone-top-geolayer="props">
                <slot
                    name="zone-top-geolayer"
                    v-bind="props"
                ></slot>
            </template>

            <template v-slot:zone-top-pic="props">
                <div
                    style="padding:6px 0px 0px 6px;"
                    v-if="withGrade && iseobj(parseSt(props.st))"
                >

                    <div :style="`height:26px; font-size:0.8rem;`">
                        {{getTitle(props.st)}}
                    </div>

                    <WLevelGrade
                        v-bind="getAttrs(props.st)"
                    >
                        <template v-slot:low="props">
                            <span v-if="!props.level.outer">
                                {{props.level.low}}
                            </span>
                            <span v-else></span>
                        </template>
                        <template v-slot:delimiter="props">
                            <span v-if="!props.level.outer">
                                {{props.level.delimiter}}
                            </span>
                            <span v-else>
                                >
                            </span>
                        </template>
                        <template v-slot:up="props">
                            <span v-if="!props.level.outer">
                                {{props.level.up}}
                            </span>
                            <span v-else>
                                {{props.level.low}}
                            </span>
                        </template>
                        <template v-slot:text="props">
                            <span>{{props.level.text}}</span>
                        </template>
                    </WLevelGrade>

                </div>
            </template>

        </WSptLiqPlotDepths>

    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import each from 'lodash-es/each.js'
import reverse from 'lodash-es/reverse.js'
import ispint from 'wsemi/src/ispint.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import dig from 'wsemi/src/dig.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import WLevelGrade from 'w-component-vue/src/components/WLevelGrade.vue'
import WSptLiqPlotDepths from './WSptLiqPlotDepths.vue'


function getLevelsAndValue(grade, v) {

    //levels, value
    let levels = []
    let value = null
    for (let i = 0; i <= grade.n; i++) {
        let ks = `tv${i}`
        let low = get(grade, ks, '')
        let ke = `tv${i + 1}`
        let up = get(grade, ke, '')
        let cs = get(grade, `c${i}`, '')
        let text = get(grade, `l${i}`, '')
        let outer = false
        let range = ''
        if (isnum(low) && isnum(up)) {
            range = `${low}~${up}`
        }
        else {
            outer = true
            up = 1e20
            range = `>${low}`
        }
        let level = {
            outer,
            range,
            low,
            up,
            delimiter: '~',
            text,
            color: cs,
        }
        if (isnum(low) && isnum(up)) {
            if (v >= low && v < up) {
                value = (low + up) / 2
            }
        }
        else {
            if (v >= low) {
                value = low
            }
        }
        levels.push(level)
    }

    //reverse
    levels = reverse(levels)

    return {
        levels,
        value,
    }
}


/**
 * 於WSptLiqPlotDepths各參數圖上方添加分級評估結果，取用各參數圖數據最深處之值，並依kpGrade之分級門檻繪製等級條與顯示數值
 *
 * 分級僅套用於key含有kpGrade各鍵之參數圖(預設為'-PL'、'-stlTS'、'-stlIY')，其餘參數圖不顯示分級。開啟分級時會自動給予optionsPic之zoneTopHeight為115，可由外部optionsPic覆蓋
 *
 * 具名插槽(slot)：'zone-top-geolayer'為土柱圖上方區塊，提供作用域參數width與height
 *
 * @vue-prop {Array} [sts=[]] 輸入多個繪圖狀態物件陣列，可由getSts產生，格式同WSptLiqPlotDepths之sts，預設[]
 * @vue-prop {Boolean} [withGrade=true] 輸入是否顯示分級評估結果布林值，預設true
 * @vue-prop {Object} [optionsPic={}] 輸入繪圖設定物件，除下列鍵值外，其餘鍵值同WSptLiqPlotDepths之optionsPic並向下傳遞，預設{}
 * @vue-prop {Object} [optionsPic.kpGrade] 輸入參數關鍵字對應分級設定物件，key為參數關鍵字(如'-PL'、'-stlTS'、'-stlIY')，值為分級設定物件，未給予時使用內建預設分級
 * @vue-prop {String} [optionsPic.kpGrade.title] 輸入分級標題字串，預設無
 * @vue-prop {Number} [optionsPic.kpGrade.valueDig] 輸入分級數值取用小數點位數數字，預設無
 * @vue-prop {String} [optionsPic.kpGrade.unit] 輸入分級數值單位字串，預設無
 * @vue-prop {Number} [optionsPic.kpGrade.n] 輸入分級門檻數量數字，預設無
 * @vue-prop {Number} [optionsPic.kpGrade.tv0] 輸入第0個分級門檻值數字，其餘門檻值依序為tv1、tv2、tv3，預設無
 * @vue-prop {String} [optionsPic.kpGrade.c0] 輸入第0級顏色字串，其餘顏色依序為c1、c2、c3，預設無
 * @vue-prop {String} [optionsPic.kpGrade.l0] 輸入第0級標記文字字串，其餘標記文字依序為l1、l2、l3，預設無
 * @vue-data {Object} kpGradeDef 儲存內建預設之參數關鍵字對應分級設定物件
 * @vue-computed {Object} kpGrade 回傳實際使用之參數關鍵字對應分級設定物件
 * @vue-computed {Object} useOptionsPic 回傳實際向下傳遞至WSptLiqPlotDepths之繪圖設定物件
 */
export default {
    components: {
        WLevelGrade,
        WSptLiqPlotDepths,
    },
    props: {
        sts: {
            type: Array,
            default: () => [],
        },
        withGrade: {
            type: Boolean,
            default: true,
        },
        optionsPic: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {
            get,
            iseobj,

            kpGradeDef: {
                '-PL': {
                    title: 'PL',
                    valueDig: 2,
                    unit: '',
                    n: 3,
                    tv0: 0,
                    tv1: 5,
                    tv2: 10,
                    tv3: 15,
                    c0: 'rgba(102, 238, 119, 0.6)',
                    c1: 'rgba(255, 238, 102, 0.6)',
                    c2: 'rgba(255, 153, 34, 0.6)',
                    c3: 'rgba(238, 34, 51, 0.6)',
                    l0: '(Low)',
                    l1: '(Mid-low)',
                    l2: '(Mid-high)',
                    l3: '(High)',
                },
                '-stlTS': {
                    title: 'Settlement',
                    valueDig: 2,
                    unit: '(m)',
                    n: 3,
                    tv0: 0,
                    tv1: 0.1,
                    tv2: 0.2,
                    tv3: 0.3,
                    c0: 'rgba(102, 238, 119, 0.6)',
                    c1: 'rgba(255, 238, 102, 0.6)',
                    c2: 'rgba(255, 153, 34, 0.6)',
                    c3: 'rgba(238, 34, 51, 0.6)',
                    l0: '(Low)',
                    l1: '(Mid-low)',
                    l2: '(Mid-high)',
                    l3: '(High)',
                },
                '-stlIY': {
                    title: 'Settlement',
                    valueDig: 2,
                    unit: '(m)',
                    n: 3,
                    tv0: 0,
                    tv1: 0.1,
                    tv2: 0.2,
                    tv3: 0.3,
                    c0: 'rgba(102, 238, 119, 0.6)',
                    c1: 'rgba(255, 238, 102, 0.6)',
                    c2: 'rgba(255, 153, 34, 0.6)',
                    c3: 'rgba(238, 34, 51, 0.6)',
                    l0: '(Low)',
                    l1: '(Mid-low)',
                    l2: '(Mid-high)',
                    l3: '(High)',
                },
            },

        }
    },
    computed: {

        kpGrade: function() {
            let vo = this
            let r = get(vo, 'optionsPic.kpGrade', {})
            if (!iseobj(r)) {
                r = vo.kpGradeDef
            }
            // console.log('kpGrade', r)
            return r
        },

        useOptionsPic: function() {
            let vo = this

            //optionsPic
            let optionsPic = {
                zoneTopHeight: vo.withGrade ? 115 : 0,
                zoneBottomHeight: 0,
                ...vo.optionsPic,
            }
            // console.log('useOptionsPic', optionsPic)

            return optionsPic
        },

    },
    methods: {

        parseSt: function(st) {
            let vo = this

            //keyPick
            let keyPick = get(st, 'key', '')
            // console.log('keyPick', keyPick)

            //key
            let key = ''
            each(vo.kpGrade, (v, k) => {
                if (keyPick.indexOf(k) >= 0) {
                    key = k
                    return false //跳出
                }
            })

            //check
            if (key === '') {
                return {}
            }

            //rows
            let rows = get(st, 'item.data', [])
            // console.log('rows', rows)

            //n
            let n = size(rows)
            // console.log('n', n)

            //rowEnd
            let rowEnd = get(rows, n - 1, [])
            // console.log('rowEnd', rowEnd)

            //value
            let value = get(rowEnd, 1, 0)
            value = cdbl(value)
            // console.log('value', value)

            //grade
            let grade = get(vo.kpGrade, key)
            // console.log('grade', grade)

            //lv
            let lv = getLevelsAndValue(grade, value)
            // console.log('lv', lv)

            return {
                grade,
                lv,
                value,
            }
        },

        getAttrs: function(st) {
            let vo = this
            let r = vo.parseSt(st)
            let attrs = get(r, 'lv', {})
            return attrs
        },

        getTitle: function(st) {
            let vo = this
            let r = vo.parseSt(st)
            let text = get(r, 'grade.title', '')
            let valueDig = get(r, 'grade.valueDig', '')
            let value = get(r, 'value', 0)
            if (ispint(valueDig)) {
                value = dig(value, valueDig)
            }
            let unit = get(r, 'grade.unit', '')
            let t = `${text} = ${cstr(value)} ${unit}`
            return t
        },

    }
}
</script>

<style scoped>
</style>
