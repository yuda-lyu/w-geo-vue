<script>
import WPlot2d from './WPlot2d.vue'
import WPlot3d from './WPlot3d.vue'
import WSptLiqAnalysis from './WSptLiqAnalysis.vue'
import WSptLiqPlotDepth from './WSptLiqPlotDepth.vue'
import WSptLiqPlotDepths from './WSptLiqPlotDepths.vue'
import WSptLiqPlotDepthsWithGrades from './WSptLiqPlotDepthsWithGrades.vue'
import WSptLiqPlotDepthsWithGradesAndTools from './WSptLiqPlotDepthsWithGradesAndTools.vue'

let WGeoVue = {
    install: function(Vue) {
        Vue.component('w-plot-2-d', WPlot2d)
        Vue.component('w-plot-3-d', WPlot3d)
        Vue.component('w-spt-liq-analysis', WSptLiqAnalysis)
        Vue.component('w-spt-liq-plot-depth', WSptLiqPlotDepth)
        Vue.component('w-spt-liq-plot-depths', WSptLiqPlotDepths)
        Vue.component('w-spt-liq-plot-depths-with-grades', WSptLiqPlotDepthsWithGrades)
        Vue.component('w-spt-liq-plot-depths-with-grades-and-tools', WSptLiqPlotDepthsWithGradesAndTools)
    }
}

export default WGeoVue
</script>

