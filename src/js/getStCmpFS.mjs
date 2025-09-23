import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import keys from 'lodash-es/keys.js'
import filter from 'lodash-es/filter.js'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'


function getStCmpFS(rows, depthTitle, depthMin, depthMax, depths) {

    //row0
    let row0 = get(rows, 0, {})

    //ks
    let ks = keys(row0)
    ks = filter(ks, (k) => {
        return k.indexOf('-FS') >= 0
    })

    //ds
    let ds = []
    each(ks, (key) => {

        //data
        let data = []
        each(depths, (depth, k) => {

            //row
            let row = get(rows, k, null)

            //v
            let v = get(row, key, null)
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

        //d
        let d = {
            name: key,
            data,
        }

        //push
        ds.push(d)

    })
    // console.log('ds', ds)

    //st
    let st = {
        key: 'All-cmpFS',
        // width: 260,
        // height: 550,
        valueTitle: 'FS',
        depthTitle,
        depthMin,
        depthMax,
        item: {
            name: 'All-cmpFS',
            data: ds,
        },
        plotType: 'line+marker',
    }
    // console.log('st', st)

    return st
}


export default getStCmpFS
