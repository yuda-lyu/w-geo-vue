# w-geo-vue
A geo component for vue(vue2).

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![language](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://github.com/vuejs/vue) 
[![npm version](http://img.shields.io/npm/v/w-geo-vue.svg?style=flat)](https://npmjs.org/package/w-geo-vue) 
[![license](https://img.shields.io/npm/l/w-geo-vue.svg?style=flat)](https://npmjs.org/package/w-geo-vue) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-geo-vue/master/dist/w-geo-vue.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-geo-vue)
[![npm download](https://img.shields.io/npm/dt/w-geo-vue.svg)](https://npmjs.org/package/w-geo-vue) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-geo-vue.svg)](https://www.jsdelivr.com/package/npm/w-geo-vue)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-geo-vue/global.html).

## Example
To view some examples for more understanding, visit examples:

> **all components:** [web](//yuda-lyu.github.io/w-geo-vue/examples/app.html) [[source code](https://github.com/yuda-lyu/w-geo-vue/blob/master/docs/examples/app.html)]

## Installation
### Using npm(ES6 module):
> **Note:** w-geo-vue is mainly dependent on `w-component-vue`, `w-geo` and `wsemi`.

```alias
npm i w-geo-vue
```
Import all components:
```alias
//choose component
<w-plot-2d
    ...
></w-plot-2d>

//import
import WGeoVue from 'w-geo-vue'

//use
Vue.use(WGeoVue)
```
Import one component:
```alias
//choose component
<w-plot-2d
    ...
></w-plot-2d>

//import
import WPlot2d from 'w-geo-vue/src/components/WPlot2d.vue'

//component
Vue.component('w-plot-2d',WPlot2d)
//or
export default {
    components: {
        WPlot2d,
        //or
        'w-plot-2d': WPlot2d,
    },
    ...
}
```

### In a browser(UMD module):
> **Note:** umd file of `w-geo-vue` is mainly dependent on `vue`.

[Necessary] Add script for w-geo-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-geo-vue@1.0.13/dist/w-geo-vue.umd.js"></script>
```
Directly use:
```alias
//app and component
<div id="app">
    <w-plot-2d
        ...
    ></w-plot-2d>
</div>

//use
Vue.use(window['w-geo-vue'])

//new
new Vue({
    el: '#app',
    data: {
        ...
    }
})
```