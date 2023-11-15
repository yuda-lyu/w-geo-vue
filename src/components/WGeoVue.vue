<script>
import WPlot from './WPlot.vue'
import WSptLiqPlotDepth from './WSptLiqPlotDepth.vue'
import WSptLiqPlotDepths from './WSptLiqPlotDepths.vue'
import WSptLiqPlotDepthsWithGrades from './WSptLiqPlotDepthsWithGrades.vue'
import WSptLiqPlotDepthsWithGradesAndTools from './WSptLiqPlotDepthsWithGradesAndTools.vue'

let WGeoVue = {
    install: function(Vue) {
        Vue.component('w-plot', WPlot)
        Vue.component('w-spt-liq-plot-depth', WSptLiqPlotDepth)
        Vue.component('w-spt-liq-plot-depths', WSptLiqPlotDepths)
        Vue.component('w-spt-liq-plot-depths-with-grades', WSptLiqPlotDepthsWithGrades)
        Vue.component('w-spt-liq-plot-depths-with-grades-and-tools', WSptLiqPlotDepthsWithGradesAndTools)
    }
}

export default WGeoVue
</script>

