import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import keys from 'lodash-es/keys.js'
import isNumber from 'lodash-es/isNumber.js'
import pull from 'lodash-es/pull.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import getStGeolayer from './getStGeolayer.mjs'
import getStCmpFS from './getStCmpFS.mjs'
import getStParam from './getStParam.mjs'


function getSts(rows, kpCvKey, depthTitle, geolayerWidth, geolayerWaterLevel, opt = {}) {

    //plotTypeForParam
    let plotTypeForParam = get(opt, 'plotTypeForParam')
    if (plotTypeForParam !== 'line+marker' && plotTypeForParam !== 'line' && plotTypeForParam !== 'marker') {
        plotTypeForParam = 'line+marker'
    }

    //optParam
    let optParam = {
        plotType: plotTypeForParam,
    }

    //clean
    if (true) {
        let keysDel

        let rowsTemp = cloneDeep(rows)

        keysDel = ['waterLevelUsual', 'waterLevelDesign', 'PGA', 'Ml', 'Mw', 'vibrationType']
        rowsTemp = map(rowsTemp, (row) => {
            each(keysDel, (k) => {
                delete row[k]
            })
            return row
        })
        // console.log('rowsTemp', rowsTemp)

        keysDel = ['-H1', '-rrd', '-N160', '-N160cs', '-N172', '-N172cs', '-cFC', '-Na', '-Rl', '-ks', '-cw', '-c1', '-c2', '-CN', '-RL', '-alpha', '-beta', '-dNf', '-CRR75']
        rowsTemp = map(rowsTemp, (row) => {
            each(row, (r, kr) => {
                each(keysDel, (k) => {
                    if (kr.indexOf(k) >= 0) {
                        delete row[kr]
                    }
                })
            })
            return row
        })

        //update
        // console.log('rows(ori)', cloneDeep(rows))
        rows = rowsTemp
        // console.log('rows(clean)', cloneDeep(rows))

    }

    //row0
    let row0 = get(rows, 0, {})

    //ks
    let ks = keys(row0)
    pull(ks, ...['depthStart', 'depthEnd', 'depth'])
    // console.log('ks', ks)

    //depthMin, depthMax
    let depthMin = 1e20
    let depthMax = -1e20
    each(rows, (v) => {
        let ds = get(v, 'depthStart')
        let de = get(v, 'depthEnd')
        if (isnum(ds)) {
            ds = cdbl(ds)
            depthMin = Math.min(depthMin, ds)
            depthMax = Math.max(depthMax, ds)
        }
        if (isnum(de)) {
            de = cdbl(de)
            depthMin = Math.min(depthMin, de)
            depthMax = Math.max(depthMax, de)
        }
    })

    //depths
    let depths = map(rows, 'depth')
    depths = map(depths, cdbl)
    // console.log('depths', depths)

    //sts
    let sts = []

    //sts for parms
    if (true) {
        each(ks, (k) => {

            //key
            let key = ''
            if (!isestr(key) && haskey(kpCvKey, k)) {
                key = get(kpCvKey, k, '')
            }
            if (!isestr(key)) {
                key = k
            }

            //valueTitle
            let valueTitle = ''
            if (!isestr(valueTitle) && haskey(kpCvKey, k)) {
                valueTitle = get(kpCvKey, k, '')
            }
            if (!isestr(valueTitle) && k.indexOf('-CRR') >= 0) {
                valueTitle = 'CRR'
            }
            if (!isestr(valueTitle) && k.indexOf('-CSR') >= 0) {
                valueTitle = 'CSR'
            }
            if (!isestr(valueTitle) && k.indexOf('-FS') >= 0) {
                valueTitle = 'FS'
            }
            if (!isestr(valueTitle) && k.indexOf('-PL') >= 0) {
                valueTitle = 'PL'
            }
            if (!isestr(valueTitle) && k.indexOf('-stl') >= 0) {
                valueTitle = 'Settlement(m)'
            }
            if (!isestr(valueTitle) && k.indexOf('-vstr') >= 0) {
                valueTitle = 'Vol. strain(%)'
            }
            if (!isestr(valueTitle)) {
                valueTitle = k
            }

            //params
            let params = map(rows, k)
            params = map(params, (p) => {
                if (isnum(p)) {
                    p = cdbl(p)
                }
                else {
                    p = null //非數字則使用null, 使highcharts能略過繪圖點
                }
                return p
            })
            // console.log(k, 'params', params)

            //check
            let b = false
            each(params, (p) => {
                if (isNumber(p)) {
                    b = true
                    return false //跳出
                }
            })
            if (!b) {
                return true //跳出換下一個
            }

            //getStParam
            let st = getStParam(key, valueTitle, depthTitle, depthMin, depthMax, depths, params, optParam)
            // console.log(k, 'st', st)

            //push
            sts.push(st)

        })
    }

    //sts for cmpFS
    if (true) {

        //getStCmpFS
        let st = getStCmpFS(rows, depthTitle, depthMin, depthMax, depths)
        // console.log('st', st)

        //push
        sts.push(st)

    }

    //sts for Geolayer
    if (true) {

        //getStGeolayer
        let st = getStGeolayer(rows, depthTitle, geolayerWidth, geolayerWaterLevel)
        // console.log('st', st)

        //插入最前面
        sts = [
            st,
            ...sts,
        ]

    }

    return sts
}


export default getSts
