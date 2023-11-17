import isestr from 'wsemi/src/isestr.mjs'
import replace from 'wsemi/src/replace.mjs'


function spc2html(c) {
    if (!isestr(c)) {
        return ''
    }
    if (c.indexOf('m2') >= 0) {
        c = replace(c, 'm2', 'm<sup>2</sup>')
    }
    if (c.indexOf('m3') >= 0) {
        c = replace(c, 'm3', 'm<sup>3</sup>')
    }
    if (c.indexOf('cm2') >= 0) {
        c = replace(c, 'cm2', 'cm<sup>2</sup>')
    }
    if (c.indexOf('cm3') >= 0) {
        c = replace(c, 'cm3', 'cm<sup>3</sup>')
    }
    return c
}


export default spc2html
