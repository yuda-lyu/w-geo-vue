<template>
    <div
        :style="`display:inline-block; width:${widthInp}px; min-width:${widthInp}px; height:${heightInp}px; overflow-y:hidden;`"
        :changeOptions="changeOptions"
    >

        <div
            ref="panel"
            :style="`position:relative; width:${widthInp}px; height:${heightInp}px;`"
        >
            bbb
        </div>

    </div>
</template>

<script>
import get from 'lodash-es/get'
import size from 'lodash-es/size'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import min from 'lodash-es/min'
import max from 'lodash-es/max'
import isNumber from 'lodash-es/isNumber'
import cloneDeep from 'lodash-es/cloneDeep'
import evem from 'wsemi/src/evem.mjs'
import waitFun from 'wsemi/src/waitFun.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isEle from 'wsemi/src/isEle.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import pmSeries from 'wsemi/src/pmSeries.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import oc from 'wsemi/src/color.mjs'
import domRemove from 'wsemi/src/domRemove.mjs'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import { STLLoader } from 'three/addons/loaders/STLLoader.js'
// import { STLExporter } from 'three/addons/exporters/STLExporter.js';
// import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
// import CameraControls from 'camera-controls'


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
 */
export default {
    components: {
    },
    props: {
        options: {
            type: Object,
            default: () => {},
        },
        width: {
            type: Number,
            default: 400,
        },
        height: {
            type: Number,
            default: 400,
        },
    },
    data: function() {
        return {

            ev: null,

        }
    },
    beforeDestroy: function() {
        let vo = this
        // vo.dispose()
    },
    computed: {

        changeOptions: function() {
            console.log('changeOptions')
            let vo = this
            // vo.plot()
            return ''
        },

        widthInp: function() {
            //console.log('computed widthInp')

            let vo = this

            //w
            let w = vo.width
            let wOpt = get(vo, 'options.width', '')
            if (isnum(wOpt)) {
                w = cdbl(wOpt)
            }

            return w
        },

        heightInp: function() {
            //console.log('computed heightInp')

            let vo = this

            //h
            let h = vo.height
            let hOpt = get(vo, 'options.height', '')
            if (isnum(hOpt)) {
                h = cdbl(hOpt)
            }

            return h
        },

    },
    methods: {

        // plot: function() {
        //     let vo = this

        //     async function core() {

        //         //dispose
        //         vo.dispose()

        //         //waitFun
        //         await waitFun(() => {
        //             return isEle(vo.$refs.panel)
        //         })
        //         // console.log('vo.$refs.panel', vo.$refs.panel)

        //         //cloneDeep
        //         let options = cloneDeep(vo.options)

        //         //items
        //         let items = get(options, 'items', [])
        //         // console.log('items', items)

        //         //plot3d
        //         let opt = {
        //             domPanel: vo.$refs.panel,
        //         }
        //         let ev = await plot3d(items, opt)

        //         //on
        //         ev.on('loading', (msg) => {
        //             console.log('loading', msg)
        //         })

        //         //save
        //         vo.ev = ev

        //         console.log('init')
        //     }

        //     //core
        //     core()
        //         .catch((err) => {
        //             console.log(err)
        //         })

        // },

        // //bbb call ev.resize

        // dispose: function() {
        //     let vo = this

        //     //使用setTimeout讓記憶體脫勾, 避免被computed視為連動
        //     setTimeout(() => {

        //         //check
        //         if (vo.ev === null) {
        //             return
        //         }

        //         //dispose
        //         let fun = get(vo, 'ev.dispose')
        //         if (isfun(fun)) {
        //             console.log('call dispose')
        //             vo.ev.dispose()
        //             vo.ev = null
        //         }

        //     }, 1)

        // },

    },
}
</script>

<style scoped>
</style>
