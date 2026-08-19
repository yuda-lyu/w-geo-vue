<template>
    <div
        :style="`display:inline-block; width:${widthInp}px; min-width:${widthInp}px; height:${heightInp}px; overflow-y:hidden;`"
        v-if="options"
    >

        <WHighchartsVue
            :options="options"
        ></WHighchartsVue>

    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import WHighchartsVue from 'w-highcharts-vue/src/components/WHighchartsVue.vue'


/**
 * 由Highcharts設定物件繪製2D圖，繪圖寬度取用設定物件內之chart.width，若非數字則使用400；繪圖高度優先取用設定物件內之chart.height，若非數字則取用組件height
 *
 * @vue-prop {Object} [options={}] 輸入Highcharts繪圖設定物件，需有內容才會渲染繪圖，預設{}
 * @vue-prop {Number} [options.chart.width] 輸入繪圖寬度數字，單位px，非數字時使用400，預設無
 * @vue-prop {Number} [options.chart.height] 輸入繪圖高度數字，單位px，優先於組件height，預設無
 * @vue-prop {Number} [height=400] 輸入繪圖高度數字，單位px，當options.chart.height為數字時則不使用，預設400
 * @vue-computed {Number} widthInp 回傳實際使用之繪圖寬度數字
 * @vue-computed {Number} heightInp 回傳實際使用之繪圖高度數字
 */
export default {
    components: {
        WHighchartsVue,
    },
    props: {
        options: {
            type: Object,
            default: () => {},
        },
        // width: {
        //     type: Number,
        //     default: 400,
        // },
        height: {
            type: Number,
            default: 400,
        },
    },
    data: function() {
        return {
        }
    },
    computed: {

        widthInp: function() {
            //console.log('computed widthInp')

            let vo = this

            //w
            let w = get(vo, 'options.chart.width', '') //優先使用options內寬度
            if (!isnum(w)) {
                w = 400
            }
            w = cdbl(w)

            return w
        },

        heightInp: function() {
            //console.log('computed heightInp')

            let vo = this

            //h
            let h = vo.height
            let hOpt = get(vo, 'options.chart.height', '') //優先使用options內高度
            if (isnum(hOpt)) {
                h = cdbl(hOpt)
            }

            return h
        },

    },
    methods: {

    },
}
</script>

<style scoped>
</style>
