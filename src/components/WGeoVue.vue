<script>
import WPlot from './WPlot.vue'
import WSptPlotDepth from './WSptPlotDepth.vue'
import WSptPlotDepths from './WSptPlotDepths.vue'
import WSptPlotDepthsWithGrades from './WSptPlotDepthsWithGrades.vue'
import WSptPlotDepthsWithGradesAndTools from './WSptPlotDepthsWithGradesAndTools.vue'

let WGeoVue = {
    install: function(Vue) {
        Vue.component('w-plot', WPlot)
        Vue.component('w-spt-plot-depth', WSptPlotDepth)
        Vue.component('w-spt-plot-depths', WSptPlotDepths)
        Vue.component('w-spt-plot-depths-with-grades', WSptPlotDepthsWithGrades)
        Vue.component('w-spt-plot-depths-with-grades-and-tools', WSptPlotDepthsWithGradesAndTools)
    }
}

export default WGeoVue
</script>

