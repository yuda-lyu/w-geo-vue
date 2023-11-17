<template>
    <div :style="``">

        <!-- 預設給予zoneTopHeight與zoneBottomHeight, 若外部有另外給予可覆蓋 -->
        <WSptLiqPlotDepths
            :sts="sts"
            :optionsExt="{
                zoneTopHeight:115,
                zoneBottomHeight:0,
                ...optionsExt,
            }"
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
                    v-if="iseobj(parseSt(props.st))"
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
import get from 'lodash/get'
import size from 'lodash/size'
import each from 'lodash/each'
import reverse from 'lodash/reverse'
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
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
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
        optionsExt: {
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
            let r = get(vo, 'optionsExt.kpGrade', {})
            if (!iseobj(r)) {
                r = vo.kpGradeDef
            }
            // console.log('kpGrade', r)
            return r
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
