<template>
    <div style="display:flex;">

        <div :style="``">

            <div :style="`width:${st0.width}px; height:${zoneTopHeight}px; overflow:auto;`">
                <slot
                    name="zone-top-geologic-column"
                    :width="st0.width"
                    :height="zoneTopHeight"
                ></slot>
            </div>

            <!-- paddingStyle須配合getDefChart的margin值 -->
            <WSegmentsVertical
                :items="st0.item.data"
                :width="st0.width"
                :height="st0.height"
                :paddingStyle="{
                    top: 25,
                    right: 0,
                    bottom: 55,
                    left: 85,
                }"
                :tickSize="30"
                :segmentSize="50"
                :segmentBackgroundType="'image'"
                :funSegmentBackgroundImage="getSegmentBackgroundIcon"
                :segmentBorderColor="{v:'transparent',h:'#444'}"
                :axisColor="'transparent'"
                :tickColor="'#444'"
                :keyValueStart="'depthStart'"
                :keyValueEnd="'depthEnd'"
                :keyText="'description'"
                :alignEnd="'left'"
                :textShift="80"
                :title="st0.depthTitle"
                :funFormatTickValue="getTickValue"
                v-if="st0.item.type==='geologic column'"
            >
                <template v-slot:support-right="props">
                    <div :style="`padding-top:${props.convertValueToY(waterLevel)}px;`">

                        <!-- anchor line, 圖標與數值寬度38px -->
                        <div style="_width:38px; _border-top:1px solid #f26;">

                            <!-- wl vertical center line, 圖標與數值垂直中線距左側19px -->
                            <div style="padding-left:19px;">

                                <div style="position:relative;">

                                    <!-- water level text -->
                                    <div style="position:absolute; top:-30px; left:1px; transform:translateX(-50%);">
                                        <div style="white-space:nowrap; transform-origin:center; transform:scale(0.6);">
                                            {{waterLevel}}m
                                        </div>
                                    </div>

                                    <!-- water level icon -->
                                    <div style="position:absolute; top:-15px; left:0px; transform:translateX(-50%);">
                                        <svg width="14" height="12" viewBox="0 0 14 12">
                                            <polygon points="2,0 12,0 7,9" style="fill:rgba(0,0,0,0);stroke:#000;stroke-width:1" />
                                            <line x1="0" y1="9" x2="14" y2="9" style="stroke:#000;stroke-width:1" />
                                            <line x1="4" y1="11" x2="11" y2="11" style="stroke:#000;stroke-width:1" />
                                        </svg>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                </template>
            </WSegmentsVertical>

            <div :style="`width:${st0.width}px; height:${zoneBottomHeight}px; overflow:auto;`">
                <slot
                    name="zone-bottom-geologic-column"
                    :width="st0.width"
                    :height="zoneBottomHeight"
                ></slot>
            </div>

        </div>

        <div>

            <div style="display:flex; align-items:flex-start;">

                <div
                    :style="`height:${st.height}px;`"
                    :key="kst"
                    v-for="(st,kst) in stOthers"
                >
                    <WSptPlotDepth
                        :st="st"
                        :optionsExt="optionsExt"
                    >

                        <template v-slot:top="props">
                            <div :style="`width:${getWidth(props.opt)}px; height:${zoneTopHeight}px; overflow:auto;`">
                                <slot
                                    name="zone-top-pic"
                                    :width="getWidth(props.opt)"
                                    :height="zoneTopHeight"
                                    :st="st"
                                ></slot>
                            </div>
                        </template>

                        <template v-slot:bottom="props">
                            <div :style="`width:${getWidth(props.opt)}px; height:${zoneBottomHeight}px; overflow:auto;`">
                                <slot
                                    name="zone-bottom-pic"
                                    :width="getWidth(props.opt)"
                                    :height="zoneBottomHeight"
                                    :st="st"
                                ></slot>
                            </div>
                        </template>

                    </WSptPlotDepth>
                </div>

            </div>

        </div>

    </div>
</template>

<script>
import get from 'lodash/get'
import filter from 'lodash/filter'
import dig from 'wsemi/src/dig.mjs'
import WSegmentsVertical from 'w-component-vue/src/components/WSegmentsVertical.vue'
import WSptPlotDepth from './WSptPlotDepth.vue'


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
 */
export default {
    components: {
        WSegmentsVertical,
        WSptPlotDepth,
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
        }
    },
    computed: {

        st0: function() {
            //console.log('computed st0')

            let vo = this

            let r = get(vo.sts, 0, [])
            // console.log('st0', r)

            return r
        },

        waterLevel: function() {
            //console.log('computed waterLevel')

            let vo = this

            let r = get(vo, 'st0.waterLevel', 0)
            // console.log('waterLevel', r)

            return r
        },

        stOthers: function() {
            //console.log('computed stOthers')

            let vo = this

            let r = filter(vo.sts, (v) => {
                let type = get(v, 'item.type', '')
                return type !== 'geologic column'
            })
            // console.log(JSON.stringify(r))
            // console.log(JSON.stringify(r[r.length - 1]))
            return r
        },

        zoneTopHeight: function() {
            let vo = this
            let h = get(vo, 'optionsExt.zoneTopHeight', 0)
            return h
        },

        zoneBottomHeight: function() {
            let vo = this
            let h = get(vo, 'optionsExt.zoneBottomHeight', 0)
            return h
        },

    },
    methods: {

        getSegmentBackgroundIcon: function(item) {
            // console.log('getSegmentBackgroundIcon', item)
            let kp = window.dataCivilSoilCodeIcon
            // console.log('dataCivilSoilCodeIcon', kp)
            // console.log('item.legendCode', item.legendCode)
            let bgicon = kp[item.legendCode]
            // console.log('bgicon', bgicon)
            return bgicon
        },

        getTickValue: function(v) {
            return dig(v, 1)
        },

        getWidth: function(opt) {
            let w = get(opt, 'chart.width', 0)
            return w
        },

    }
}
</script>

<style scoped>
</style>
