//getKeyStsSelects 之單元測試(純函數, 不起瀏覽器): 對應 建議w-geo-vue修正.md(Gitea issue #34)
//「新勾選之方法, 其 FS、PL、stlTS、stlIY 自動勾選並繪圖(含頁面初始已勾之方法); 取消勾選後其參數與圖移除」
//鍵集取自 anaSptLiq 之真實 sts(各方法組合), 期望值為依規格與元件預設過濾設定(keyParamSelects)獨立列出之字面值
import assert from 'assert'
import getKeyStsSelects from '../src/js/getKeyStsSelects.mjs'
import anaSptLiq from '../src/js/anaSptLiq.mjs'
import { getRowsLiq } from './fixtures/rowsLiq.mjs'


//元件預設值(src/components/WSptLiqAnalysis.vue 之 keyParamSelects 預設)
const KEY_PARAM_SELECTS = [
    { keyFull: 'Geolayer' },
    { keyPart: 'N60' },
    { keyFull: 'FC(%)' },
    { keyPart: '-FS' },
    { keyPart: '-cmpFS' },
    { keyPart: '-PL' },
    { keyPart: '-stl' },
]
const COMMON = ['Geolayer', 'N60', 'FC(%)', 'All-cmpFS']
const ofM = (m) => [`${m}-FS`, `${m}-PL`, `${m}-stlTS`, `${m}-stlIY`] //規格: 方法之 FS、PL 與沉陷量(stlTS、stlIY)


//stsKeys, 以元件相同之分析入口取得某方法組合之真實 sts 鍵
function stsKeys(methods) {
    let kpTrans = { 'SPTN': 'N60', 'Gt_dry': 'rd', 'Gt_sat': 'rsat', 'ctFine': 'FC', 'code': 'legendCode', 'USCS': 'soilClassification' }
    let rowsIn = getRowsLiq().map((row) => {
        let r = {}
        Object.keys(row).forEach((k) => {
            r[kpTrans[k] || k] = row[k]
        })
        return r
    })
    let kpHead = { 'depth': 'depth(m)', 'N60': 'N60', 'FC': 'FC(%)' }
    let r = anaSptLiq(rowsIn, { unitSvSvp: 'MPa', methods, kpHead, kpDig: {}, depthTitle: 'Depth(m)', geolayerWidth: 240, geolayerWaterLevel: 0.5 })
    return r.sts.map((s) => s.key)
}

const sorted = (a) => [...a].sort()


describe('unit-getKeyStsSelects', function() {

    //驗證建議1: 頁面初始已勾之方法(sptSeed)其 FS、PL、stlTS、stlIY 為已勾
    it('首次出現之參數依過濾設定自動勾選', function() {
        let keysNow = stsKeys(['sptSeed'])
        let r = getKeyStsSelects(keysNow, [], [], KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r.keyStsSelects), sorted([...COMMON, ...ofM('sptSeed')]))
        assert.ok(!r.keyStsSelects.includes('sptSeed-CRR'), '不符過濾設定者不勾選')
        assert.deepStrictEqual(r.keysPrev, keysNow)
    })

    //驗證建議2: 再勾選 sptTY → 其 FS、PL、stlTS、stlIY 自動勾選(keyStsSelects 增加其鍵); 取消勾選後移除
    it('新勾選方法其參數自動加入, 取消勾選自勾選移除, 再勾選重新加入', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let k3 = stsKeys(['sptHBF2017', 'sptNJRA2017', 'sptTY'])
        let base = [...COMMON, ...ofM('sptHBF2017'), ...ofM('sptNJRA2017')]

        //初始(2 個方法)
        let r0 = getKeyStsSelects(k2, [], [], KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r0.keyStsSelects), sorted(base))

        //勾選 sptTY
        let r1 = getKeyStsSelects(k3, r0.keysPrev, r0.keyStsSelects, KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r1.keyStsSelects), sorted([...base, ...ofM('sptTY')]))
        assert.ok(!r1.keyStsSelects.includes('sptTY-CRR'))

        //取消勾選 sptTY
        let r2 = getKeyStsSelects(k2, r1.keysPrev, r1.keyStsSelects, KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r2.keyStsSelects), sorted(base))
        assert.deepStrictEqual(r2.keysPrev, k2)

        //再勾選 sptTY
        let r3 = getKeyStsSelects(k3, r2.keysPrev, r2.keyStsSelects, KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r3.keyStsSelects), sorted([...base, ...ofM('sptTY')]))
    })

    //勾選方法時不得動到使用者對既有參數之選擇: 已取消勾選的不恢復, 已額外勾選的不移除
    it('使用者對既有參數之勾選結果維持', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let k3 = stsKeys(['sptHBF2017', 'sptNJRA2017', 'sptTY'])
        let r0 = getKeyStsSelects(k2, [], [], KEY_PARAM_SELECTS)
        let user = r0.keyStsSelects.filter((k) => k !== 'sptHBF2017-FS') //使用者取消勾選
        user.push('sptHBF2017-CRR') //使用者額外勾選
        let r1 = getKeyStsSelects(k3, r0.keysPrev, user, KEY_PARAM_SELECTS)
        assert.ok(!r1.keyStsSelects.includes('sptHBF2017-FS'), '使用者取消勾選者不得因新勾選方法而恢復')
        assert.ok(r1.keyStsSelects.includes('sptHBF2017-CRR'), '使用者額外勾選者須保留')
        ofM('sptTY').forEach((k) => assert.ok(r1.keyStsSelects.includes(k), k))
    })

    //使用者全部取消後, 鍵集不變之重算(例如換 rows)不得恢復預設勾選
    it('使用者全部取消後不恢復, 新勾選方法仍只加入該方法參數', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let k3 = stsKeys(['sptHBF2017', 'sptNJRA2017', 'sptTY'])
        let r0 = getKeyStsSelects(k2, k2, [], KEY_PARAM_SELECTS)
        assert.deepStrictEqual(r0.keyStsSelects, [])
        let r1 = getKeyStsSelects(k3, k2, [], KEY_PARAM_SELECTS)
        assert.deepStrictEqual(sorted(r1.keyStsSelects), sorted(ofM('sptTY')))
    })

    //尚無分析結果(rows 為空)或分析失敗(sts 為空)時不變更, 且保留前次鍵集: 失敗後以相同鍵集恢復, 使用者之勾選結果不被重設
    it('sts 為空時不變更, 恢復後維持使用者勾選', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let user = ['Geolayer', 'sptHBF2017-FS']
        let r0 = getKeyStsSelects([], k2, user, KEY_PARAM_SELECTS)
        assert.strictEqual(r0.keyStsSelects, user)
        assert.strictEqual(r0.keysPrev, k2)
        let r1 = getKeyStsSelects(k2, r0.keysPrev, r0.keyStsSelects, KEY_PARAM_SELECTS)
        assert.deepStrictEqual(r1.keyStsSelects, user)

        //首次即無資料, 之後才有: 視為首次出現而自動勾選
        let r2 = getKeyStsSelects([], [], [], KEY_PARAM_SELECTS)
        assert.deepStrictEqual(r2.keyStsSelects, [])
        let r3 = getKeyStsSelects(k2, r2.keysPrev, r2.keyStsSelects, KEY_PARAM_SELECTS)
        assert.strictEqual(r3.keyStsSelects.length, COMMON.length + 8)
    })

    //無變更時回傳輸入之原陣列(元件以參照比較判斷是否寫回, 避免 computed 因自身依賴被寫入而重複觸發)
    it('無變更時回傳原參照', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let r0 = getKeyStsSelects(k2, [], [], KEY_PARAM_SELECTS)
        let r1 = getKeyStsSelects([...k2], r0.keysPrev, r0.keyStsSelects, KEY_PARAM_SELECTS)
        assert.strictEqual(r1.keysPrev, r0.keysPrev)
        assert.strictEqual(r1.keyStsSelects, r0.keyStsSelects)
    })

    //過濾設定: keyFull 需完全相同, keyPart 需部份含有, 無設定(空陣列/undefined)不自動勾選
    it('過濾設定之 keyFull 與 keyPart 判斷, 無設定不自動勾選', function() {
        let keysNow = ['Geolayer', 'Geolayer2', 'N60', 'x-FS', 'x-CRR']
        let r = getKeyStsSelects(keysNow, [], [], [{ keyFull: 'Geolayer' }, { keyPart: '-FS' }])
        assert.deepStrictEqual(r.keyStsSelects, ['Geolayer', 'x-FS'])
        assert.deepStrictEqual(getKeyStsSelects(keysNow, [], [], []).keyStsSelects, [])
        assert.deepStrictEqual(getKeyStsSelects(keysNow, [], [], undefined).keyStsSelects, [])
        assert.deepStrictEqual(getKeyStsSelects(keysNow, [], [], [{}]).keyStsSelects, [])
    })

    //輸入不被改動
    it('輸入陣列不被改動', function() {
        let k2 = stsKeys(['sptHBF2017', 'sptNJRA2017'])
        let k3 = stsKeys(['sptHBF2017', 'sptNJRA2017', 'sptTY'])
        let prev = [...k2]
        let sel = ['Geolayer', 'sptHBF2017-FS']
        let flt = JSON.parse(JSON.stringify(KEY_PARAM_SELECTS))
        getKeyStsSelects(k3, prev, sel, flt)
        assert.deepStrictEqual(prev, k2)
        assert.deepStrictEqual(sel, ['Geolayer', 'sptHBF2017-FS'])
        assert.deepStrictEqual(flt, KEY_PARAM_SELECTS)
    })

})
