import _ from 'lodash-es'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src/components/'
let fdTar = './dist'


rollupFiles({
    fns: 'WGeoVue.vue',
    fdSrc,
    fdTar,
    nameDistType: 'kebabCase',
    globals: {
        'vue': 'Vue',
    },
    external: [
        'vue',
    ],
})

