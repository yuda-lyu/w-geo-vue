import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isestr from 'wsemi/src/isestr.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import strleft from 'wsemi/src/strleft.mjs'


let cvUscsToCode = (USCS) => {
    let l1 = strleft(USCS, 1)
    let kp = {
        'G': '207',
        'S': '227',
        'M': '105',
        'C': '106',
        '岩': '207',
        '回': '207',
    }
    if (haskey(kp, l1)) {
        return kp[l1]
    }
    return kp['C'] //查不到則預設給予黏土
}

function getStGeolayer(rows, depthTitle, width, waterLevel) {

    //data
    let data = []
    each(rows, (r, kr) => {
        let depthStart = get(r, 'depthStart', '')
        let depthEnd = get(r, 'depthEnd', '')
        let depth = get(r, 'depth', '')
        let legendCode = get(r, 'legendCode', '')
        let description = get(r, 'description', '')
        let soilClassification = get(r, 'soilClassification', '')

        //check
        if (!isestr(legendCode) && isestr(soilClassification)) {
            legendCode = cvUscsToCode(soilClassification)
        }

        let dsp = ''
        if (isestr(description) && !isestr(soilClassification)) {
            dsp = description
        }
        else if (!isestr(description) && isestr(soilClassification)) {
            dsp = soilClassification
        }
        else if (isestr(description) && isestr(soilClassification)) {
            dsp = `${soilClassification}, ${description}`
        }

        let d = {
            depthStart,
            depthEnd,
            depth,
            legendCode,
            description: dsp,
        }

        data.push(d)

    })
    // console.log('data', data)

    //st
    let st = {
        key: 'Geolayer',
        width,
        // height: 550,
        valueTitle: 'geologic',
        depthTitle,
        // depthMin: 0, //不須使用
        // depthMax: 20, //不須使用
        waterLevel,
        item: {
            type: 'Geolayer',
            name: '',
            data,
        },
        plotType: 'none',
    }
    // console.log('st', st)

    return st
}


export default getStGeolayer
