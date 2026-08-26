<template>
    <div class="bkh">


        <div class="head1"><span style="cursor:pointer;" title="open for copy link to view component" onclick="window.open('//yuda-lyu.github.io/w-geo-vue/examples/app.html?cmp='+this.innerText,'_blank')">w-soil-column</span></div>


        <div style="padding:0px;">


            <div class="bk">
                <demolink
                    :pkgname="'w-geo-vue'"
                    :kbname="'w-soil-column'"
                    :casename="'default'"
                ></demolink>

                <w-soil-column
                    :items="WSoilColumn.items1"
                ></w-soil-column>

            </div>


            <div class="bk">
                <demolink
                    :pkgname="'w-geo-vue'"
                    :kbname="'w-soil-column'"
                    :casename="'text and water level'"
                ></demolink>

                <w-soil-column
                    :items="WSoilColumn.items1"
                    :width="350"
                    :paddingStyle="{top:30,right:0,bottom:20,left:85}"
                    :tickSize="30"
                    :segmentSize="25"
                    :title="'Depth(m)'"
                    :mergeSameLayers="true"
                    :optionsSegments="{textShift:80}"
                >
                    <template v-slot:support-right="props">
                        <div :style="`padding-top:${props.convertValueToY(0.5)}px;`">
                            <div style="padding-left:19px;">
                                <div style="position:relative;">
                                    <div style="position:absolute; top:-30px; left:1px; transform:translateX(-50%);">
                                        <div style="white-space:nowrap; transform-origin:center; transform:scale(0.6);">0.5m</div>
                                    </div>
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
                    </template>
                </w-soil-column>

            </div>


        </div>


    </div>
</template>

<script>
import demolink from 'w-component-vue/src/components/demolink.vue'
import WSoilColumn from './components/WSoilColumn.vue'


export default {
    components: {
        demolink,
        WSoilColumn,
    },
    props: {
    },
    data: function() {
        return {
            'WSoilColumn': {
                'items1': [
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
                ],
            },
        }
    },
    methods: {
    }
}
</script>

<style scoped>
</style>
