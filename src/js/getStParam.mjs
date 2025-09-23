import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function getStParam(key, valueTitle, depthTitle, depthMin, depthMax, depths, params, opt = {}) {

    //plotType
    let plotType = get(opt, 'plotType', '')
    if (plotType !== 'line+marker' && plotType !== 'line' && plotType !== 'marker') {
        plotType = 'line+marker'
    }

    //data
    let data = []
    each(depths, (depth, k) => {

        //v
        let v = get(params, k, null)
        if (isnum(v)) {
            v = cdbl(v)
        }
        else {
            v = null //非數字則使用null, 使highcharts能略過繪圖點
        }

        //d
        let d = [depth, v]

        //push
        data.push(d)

    })
    // console.log('data', data)

    //st
    let st = {
        key,
        // width: 260,
        // height: 550,
        valueTitle,
        depthTitle,
        depthMin,
        depthMax,
        item: {
            name: key,
            data,
        },
        plotType,
    }
    // console.log('st', st)

    return st
}


export default getStParam
