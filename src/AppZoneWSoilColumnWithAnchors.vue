<template>
    <div class="bkh">


        <div class="head1"><span style="cursor:pointer;" title="open for copy link to view component" onclick="window.open('//yuda-lyu.github.io/w-geo-vue/examples/app.html?cmp='+this.innerText,'_blank')">w-soil-column-with-anchors</span></div>


        <div style="padding:0px;">


            <div class="bk">
                <demolink
                    :pkgname="'w-geo-vue'"
                    :kbname="'w-soil-column-with-anchors'"
                    :casename="'default'"
                ></demolink>

                <div style="width:420px;">
                    <w-soil-column-with-anchors
                        :items="WSoilColumnWithAnchors.items1"
                        :markers="WSoilColumnWithAnchors.markers1"
                        @click-marker="clickMarker1"
                    ></w-soil-column-with-anchors>
                </div>

                <div style="padding-top:10px; font-size:0.85rem; color:#666;">click-marker: {{WSoilColumnWithAnchors.msg1}}</div>

            </div>


            <div class="bk">
                <demolink
                    :pkgname="'w-geo-vue'"
                    :kbname="'w-soil-column-with-anchors'"
                    :casename="'popup and color segments'"
                ></demolink>

                <div style="width:420px;">
                    <w-soil-column-with-anchors
                        :items="WSoilColumnWithAnchors.items1"
                        :markers="WSoilColumnWithAnchors.markers2"
                        :tickDownPositive="false"
                        :layerWithPopup="true"
                        :optionsSegments="WSoilColumnWithAnchors.optionsSegments2"
                        @click-marker="clickMarker2"
                    >

                        <template v-slot:layer-popup="props">
                            <div style="padding:6px 10px; font-size:0.85rem; white-space:nowrap;">
                                <div style="font-weight:700;">{{props.item.description}}</div>
                                <div style="color:#888;">{{props.item.depthStart}}m ~ {{props.item.depthEnd}}m</div>
                            </div>
                        </template>

                    </w-soil-column-with-anchors>
                </div>

                <div style="padding-top:10px; font-size:0.85rem; color:#666;">click-marker: {{WSoilColumnWithAnchors.msg2}}</div>

            </div>


        </div>


    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import demolink from 'w-component-vue/src/components/demolink.vue'
import WSoilColumnWithAnchors from './components/WSoilColumnWithAnchors.vue'


let items1 = [
    {
        depthStart: 0,
        depthEnd: 2.025,
        legendCode: '207',
        description: 'Silty Gravel',
    },
    {
        depthStart: 2.025,
        depthEnd: 5.025,
        legendCode: '227',
        description: 'Silty Fine Sand',
    },
    {
        depthStart: 5.025,
        depthEnd: 6.525,
        legendCode: '227',
        description: 'Silty Fine Sand',
    },
    {
        depthStart: 6.525,
        depthEnd: 8.025,
        legendCode: '106',
        description: 'Low Plasticity Clay',
    },
    {
        depthStart: 8.025,
        depthEnd: 9.525,
        legendCode: '227',
        description: 'Silty Fine Sand',
    },
    {
        depthStart: 9.525,
        depthEnd: 11.025,
        legendCode: '105',
        description: 'Low Plasticity Silt with Sand',
    },
    {
        depthStart: 11.025,
        depthEnd: 12.525,
        legendCode: '105',
        description: 'Low Plasticity Silt',
    },
    {
        depthStart: 12.525,
        depthEnd: 14.025,
        legendCode: '227',
        description: 'Silty Medium Fine Sand',
    },
    {
        depthStart: 14.025,
        depthEnd: 15.525,
        legendCode: '227',
        description: 'Silty Coarse Medium Sand',
    },
    {
        depthStart: 15.525,
        depthEnd: 17.025,
        legendCode: '105',
        description: 'Low Plasticity Silt with Sand',
    },
    {
        depthStart: 17.025,
        depthEnd: 20,
        legendCode: '106',
        description: 'Low Plasticity Clay',
    },
]


let markers1 = [
    { key: 'BH', depth: 0, text: 'BH-01', subText: 'borehole', state: 'active', title: 'borehole no.' },
    { key: 'EL', depth: 0, text: 'EL 12.3', subText: 'm', title: 'ground elevation' },
    { key: 'GWL', depth: 0.5, text: 'GWL', subText: '0.5 m', title: 'ground water level' },
    { key: 'S1', depth: 4.275, text: 'S-1', subText: '4.28 m' },
    { key: 'S2', depth: 5.775, text: 'S-2', subText: '5.78 m' },
    { key: 'S3', depth: 7.275, text: 'S-3', subText: '7.28 m' },
    { key: 'S4', depth: 13.275, text: 'S-4', subText: '13.28 m', state: 'deactive', title: 'deactive marker' },
    { key: 'S5', depth: 19.2625, text: 'S-5', subText: '19.26 m' },
]


export default {
    components: {
        demolink,
        WSoilColumnWithAnchors,
    },
    props: {
    },
    data: function() {
        return {
            'WSoilColumnWithAnchors': {
                items1,
                markers1,
                'msg1': '',
                'markers2': map(markers1, (m) => {
                    return { ...m, state: 'normal' }
                }),
                'msg2': '',
                'optionsSegments2': {
                    segmentBackgroundType: 'color',
                    segmentBackgroundColor: '#FFB74D',
                    segmentBorderColor: '#FB8C00',
                    axisColor: '#666',
                    tickColor: '#666',
                },
            },
        }
    },
    methods: {

        clickMarker1: function(msg) {
            let vo = this
            vo.WSoilColumnWithAnchors.msg1 = get(msg, 'item.key', '')
        },

        //點擊切換active狀態: 傳入新陣列即可更新各區塊樣式
        clickMarker2: function(msg) {
            let vo = this
            let key = get(msg, 'item.key', '')
            vo.WSoilColumnWithAnchors.msg2 = key
            vo.WSoilColumnWithAnchors.markers2 = map(vo.WSoilColumnWithAnchors.markers2, (m) => {
                return { ...m, state: m.key === key ? 'active' : 'normal' }
            })
        },

    }
}
</script>

<style scoped>
</style>
