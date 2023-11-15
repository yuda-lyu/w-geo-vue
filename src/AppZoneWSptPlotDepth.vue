<template>
    <div>


        <div class="head1"><span style="cursor:pointer;" title="open for copy link to view component" onclick="window.open('//yuda-lyu.github.io/w-geo-vue/examples/app.html?cmp='+this.innerText,'_blank')">w-spt-plot-depth</span></div>


        <div style="padding:0px;">


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'one line'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st1"
                ></w-spt-plot-depth>

            </div>


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'multi line'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st2"
                ></w-spt-plot-depth>

            </div>


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'one line & legendPosition(topleft)'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st1"
                    :optionsExt="{
                        legendPosition:'topleft',
                    }"
                ></w-spt-plot-depth>

            </div>


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'one line & legendPosition(topright)'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st1"
                    :optionsExt="{
                        legendPosition:'topright',
                    }"
                ></w-spt-plot-depth>

            </div>


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'one line & legendPosition(bottomleft)'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st1"
                    :optionsExt="{
                        legendPosition:'bottomleft',
                    }"
                ></w-spt-plot-depth>

            </div>


            <div class="bk">
                <demolink
                    :kbname="'w-spt-plot-depth'"
                    :casename="'one line & legendPosition(bottomright)'"
                ></demolink>

                <w-spt-plot-depth
                    :st="WSptPlotDepth.st1"
                    :optionsExt="{
                        legendPosition:'bottomright',
                    }"
                ></w-spt-plot-depth>

            </div>


        </div>


    </div>
</template>

<script>
import demolink from './components/demolink.vue'
import WSptPlotDepth from './components/WSptPlotDepth.vue'

export default {
    components: {
        demolink,
        WSptPlotDepth,
    },
    props: {
    },
    data: function() {
        return {
            'WSptPlotDepth': {
                'st1': {
                    key: 'All-cmpFS',
                    width: 260,
                    height: 550,
                    valueTitle: 'FS',
                    depthTitle: 'Depth(m)',
                    depthMin: 0,
                    depthMax: 20,
                    item: {
                        name: 'sptJRA2017-FS',
                        data: [
                            [1.0125, 0.7789314207024558],
                            [2.775, 0.5736915345361623],
                            [4.275, 0.6305899369006207],
                            [5.775, 0.4809079512648955],
                            [7.275, 1.9025769483207893],
                            [8.775, 1.9893288030422704],
                            [10.275, 2],
                            [11.775, 1.905028747319038],
                            [13.275, 1.9415949208753112],
                            [14.775, 1.953590334738463],
                            [16.275, 2],
                            [17.775, 2],
                            [19.2625, 2],
                        ],
                    },
                    plotType: 'line+marker',
                },
                'st2': {
                    key: 'All-cmpFS',
                    width: 260,
                    height: 550,
                    valueTitle: 'FS',
                    depthTitle: 'Depth(m)',
                    depthMin: 0,
                    depthMax: 20,
                    item: {
                        name: 'All-cmpFS',
                        data: [
                            {
                                name: 'sptSeed-FS',
                                data: [
                                    [1.0125, 1.2300195204453892],
                                    [2.775, 0.7641931669487014],
                                    [4.275, 0.5904622641491573],
                                    [5.775, 0.6198744238703031],
                                    [7.275, 2],
                                    [8.775, 1.7538567282841457],
                                    [10.275, 1.8424011494060215],
                                    [11.775, 1.8866063017949188],
                                    [13.275, 1.9699995916708597],
                                    [14.775, 2],
                                    [16.275, 1.9215429614148407],
                                    [17.775, 1.8808684280377663],
                                    [19.2625, 2],
                                ],
                            },
                            {
                                name: 'sptHBF2012-FS',
                                data: [
                                    [1.0125, 1.6537700284907746],
                                    [2.775, 0.8791923122750522],
                                    [4.275, 0.6420970461139518],
                                    [5.775, 0.7672387646189103],
                                    [7.275, 2],
                                    [8.775, 2],
                                    [10.275, 1.971386676453903],
                                    [11.775, 1.8784469553674072],
                                    [13.275, 2],
                                    [14.775, 2],
                                    [16.275, 1.8786823461775386],
                                    [17.775, 2],
                                    [19.2625, 1.999801187397332],
                                ],
                            },
                            {
                                name: 'sptHBF2017-FS',
                                data: [
                                    [1.0125, 1.4369805546084378],
                                    [2.775, 0.550073488465203],
                                    [4.275, 0.5815014495704269],
                                    [5.775, 0.6073564974856451],
                                    [7.275, 2],
                                    [8.775, 2],
                                    [10.275, 2],
                                    [11.775, 2],
                                    [13.275, 1.983210995349519],
                                    [14.775, 1.907506454116397],
                                    [16.275, 1.9421156359887028],
                                    [17.775, 1.9456547551859051],
                                    [19.2625, 2],
                                ],
                            },
                            {
                                name: 'sptNCEER-FS',
                                data: [
                                    [1.0125, 1.5215497277760064],
                                    [2.775, 0.6934467319753688],
                                    [4.275, 0.7639696049252113],
                                    [5.775, 0.7392914552812266],
                                    [7.275, 1.9144926125512762],
                                    [8.775, 1.913584010625697],
                                    [10.275, 2],
                                    [11.775, 2],
                                    [13.275, 2],
                                    [14.775, 2],
                                    [16.275, 2],
                                    [17.775, 2],
                                    [19.2625, 1.9595332250684208],
                                ],
                            },
                            {
                                name: 'sptJRA1996-FS',
                                data: [
                                    [1.0125, 0.6394652929316359],
                                    [2.775, 0.4221945763474594],
                                    [4.275, 0.422573955532376],
                                    [5.775, 0.359987074739875],
                                    [7.275, 2],
                                    [8.775, 2],
                                    [10.275, 2],
                                    [11.775, 2],
                                    [13.275, 1.9991668594017074],
                                    [14.775, 1.8896700382918215],
                                    [16.275, 1.9891037648738308],
                                    [17.775, 1.913342397260381],
                                    [19.2625, 2],
                                ],
                            },
                            {
                                name: 'sptJRA2017-FS',
                                data: [
                                    [1.0125, 0.7789314207024558],
                                    [2.775, 0.5736915345361623],
                                    [4.275, 0.6305899369006207],
                                    [5.775, 0.4809079512648955],
                                    [7.275, 1.9025769483207893],
                                    [8.775, 1.9893288030422704],
                                    [10.275, 2],
                                    [11.775, 1.905028747319038],
                                    [13.275, 1.9415949208753112],
                                    [14.775, 1.953590334738463],
                                    [16.275, 2],
                                    [17.775, 2],
                                    [19.2625, 2],
                                ],
                            },
                            {
                                name: 'sptTY-FS',
                                data: [
                                    [1.0125, 1.2168982455008048],
                                    [2.775, 0.5480346534145311],
                                    [4.275, 0.5657841077521539],
                                    [5.775, 0.5541787465087251],
                                    [7.275, 2],
                                    [8.775, 2],
                                    [10.275, 2],
                                    [11.775, 2],
                                    [13.275, 1.9243604004231096],
                                    [14.775, 1.982075142996793],
                                    [16.275, 2],
                                    [17.775, 1.9563862605961793],
                                    [19.2625, 1.8780409937668314],
                                ],
                            },
                        ],
                    },
                    plotType: 'line+marker',
                },
            },
        }
    },
    methods: {
    }
}
</script>

<style scoped>
</style>
