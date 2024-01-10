<template>
    <div class="bkh">


        <div class="head1"><span style="cursor:pointer;" title="open for copy link to view component" onclick="window.open('//yuda-lyu.github.io/w-geo-vue/examples/app.html?cmp='+this.innerText,'_blank')">w-plot-3d</span></div>


        <div style="padding:0px;">


            <div class="bk">
                <demolink
                    :kbname="'w-plot-3d'"
                    :casename="'default'"
                ></demolink>

                <w-plot-3d
                    :options="WPlot3d.option1"
                ></w-plot-3d>

            </div>


        </div>


    </div>
</template>

<script>
import demolink from './components/demolink.vue'
import WPlot3d from './components/WPlot3d.vue'


export default {
    components: {
        demolink,
        WPlot3d,
    },
    props: {
    },
    data: function() {
        return {
            'WPlot3d': {
                'option1': {
                    items: [

                    ]
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
