//cvNumCols、getCellText、getIdig 之單元測試(純函數, 不起瀏覽器): 值型別軸之判型、顯示文字不變、保留名稱欄、輸入不被改動; 以及轉型不改變繪圖狀態物件(getSts)
import assert from 'assert'
import calcLiquefaction from 'w-geo/src/calcLiquefaction.mjs'
import cvNumCols from '../src/js/cvNumCols.mjs'
import getCellText from '../src/js/getCellText.mjs'
import getIdig from '../src/js/getIdig.mjs'
import getSts from '../src/js/getSts.mjs'
import anaSptLiq, { isLongTextKey } from '../src/js/anaSptLiq.mjs'
import { getRowsLiqForColType } from './fixtures/rowsLiq.mjs'


//one, 單欄輸入(各列 x 欄之值)→ 判型結果
function one(vs, kpDig = {}) {
    let rows = vs.map((v) => ({ x: v }))
    let r = cvNumCols(rows, kpDig)
    return { vals: r.rows.map((o) => o.x), type: r.kpHeadFilterType.x }
}


describe('unit-cvNumCols', function() {

    //驗證建議2(輸入列之 depthStart 為文字 "9.5" 須可數值過濾): 純數字字串轉數值並使用 num 過濾器
    it('數字字串轉數值並使用num', function() {
        assert.deepStrictEqual(one(['9.5', '8', '0']), { vals: [9.5, 8, 0], type: 'num' })
        assert.deepStrictEqual(one(['-3.25', '10']), { vals: [-3.25, 10], type: 'num' })
        assert.deepStrictEqual(one(['9.5', 8]), { vals: [9.5, 8], type: 'num' }) //混有原生數值
        assert.deepStrictEqual(one([9.5, 8]), { vals: [9.5, 8], type: 'num' }) //皆為原生數值
    })

    //顯示文字不變為硬約束: 無 kpDig 時字面不同者(轉數值後顯示不同)整欄維持文字並使用 text
    it('無kpDig時字面不同者維持文字', function() {
        let cases = [
            ['17.0', '5'], //尾零
            ['007', '5'], //前導零
            [' 5 ', '6'], //前後空白
            ['1e3', '2'], //科學記號
            ['+5', '6'], //正負號
            ['-0', '1'], //負零
            ['0x10', '1'], //十六進位字樣
        ]
        cases.forEach((vs) => {
            assert.deepStrictEqual(one(vs), { vals: vs, type: 'text' }, JSON.stringify(vs))
        })
    })

    //有 kpDig 時顯示由取位決定(取位內部即先轉數值), 同樣之字面可轉為數值, 且各格顯示文字轉前轉後相同
    it('有kpDig時尾零等字面可轉且顯示不變', function() {
        let cases = [
            [['17.0', '5'], 1],
            [['007', '5'], 0],
            [[' 5 ', '6'], 1],
            [['1e3', '2'], 0],
            [['+5', '6'], 1],
        ]
        cases.forEach(([vs, idig]) => {
            let r = one(vs, { x: idig })
            assert.strictEqual(r.type, 'num', JSON.stringify(vs))
            vs.forEach((v, i) => {
                assert.strictEqual(typeof r.vals[i], 'number')
                assert.strictEqual(getCellText(r.vals[i], idig), getCellText(v, idig), `顯示文字轉型前後須相同: ${JSON.stringify(v)}`)
            })
        })
    })

    //依使用者 2026-10-31 對「有效數字」之定義(wsemi 1.9.36 isenum/dig): 十六進位、八進位、二進位字串與 Infinity 不屬有效數字, 取位只對有效數字
    //故 '0x10' 等非有效數字之字串, 即使該欄有 kpDig 亦不取位、照原樣顯示(不得為空字串), 該欄維持文字欄(不轉數值)而非先前之轉為 16
    it('有kpDig時十六進位等非有效數字字串維持文字且顯示原樣', function() {
        let cases = ['0x10', '0X1F', '0b11', '0o7']
        cases.forEach((s) => {
            let r = one([s, '1'], { x: 0 })
            assert.deepStrictEqual(r, { vals: [s, '1'], type: 'text' }, `${s} 須維持文字欄且值原樣`)
            assert.strictEqual(getCellText(s, 0), s, `${s} 顯示須為原樣, 不得為空字串`)
            assert.strictEqual(getCellText(s, 2), s)
        })
        //有效數字字串仍取位
        assert.strictEqual(getCellText('16', 2), '16.00')
        assert.strictEqual(getCellText(' 1.005 ', 2), '1.01')
    })

    //Infinity 與溢位科學記號 '1e400'(轉數值為 Infinity)非有效數字: 取位不套用, 顯示原樣而非空字串; 字串者維持文字欄
    it('Infinity與1e400不取位, 顯示原樣', function() {
        //getCellText: 有 idig 時亦照原樣文字化
        assert.strictEqual(getCellText(Infinity, 2), 'Infinity')
        assert.strictEqual(getCellText(-Infinity, 2), '-Infinity')
        assert.strictEqual(getCellText('Infinity', 2), 'Infinity')
        assert.strictEqual(getCellText('-Infinity', 2), '-Infinity')
        assert.strictEqual(getCellText('1e400', 2), '1e400')
        assert.strictEqual(getCellText('-1e400', 2), '-1e400')
        assert.notStrictEqual(getCellText(1e300, 0), '', '有限大數仍取位(非有效數字之界線為非有限, 不是大小)')

        //cvNumCols: 字串者維持文字欄且值原樣(有無 kpDig 皆然)
        let kpDigs = [{}, { x: 0 }, { x: 2 }]
        let colsText = [['Infinity', '1'], ['-Infinity', '1'], ['1e400', '1'], ['-1e400', '2']]
        kpDigs.forEach((kpDig) => {
            colsText.forEach((vs) => {
                assert.deepStrictEqual(one(vs, kpDig), { vals: vs, type: 'text' }, `${JSON.stringify(vs)} ${JSON.stringify(kpDig)}`)
            })
        })

        //原生 Infinity 數值無須轉換: 值不變(不轉為其他值), 顯示為 Infinity
        let r = one([Infinity, 1], { x: 2 })
        assert.deepStrictEqual(r.vals, [Infinity, 1])
        assert.strictEqual(getCellText(r.vals[0], 2), 'Infinity')
    })

    //數值字串須為有限值且不超過安全整數: Infinity、溢位科學記號、超過 2^53 之整數即使有 kpDig 亦維持文字(轉換會夾限或失去精度)
    it('非有限值與超過安全整數之字串維持文字', function() {
        let kpDig = { x: 0 }
        let cases = [['Infinity', '1'], ['-Infinity', '1'], ['1e309', '1'], ['9007199254740993', '1'], ['-9007199254740993', '1']]
        cases.forEach((vs) => {
            assert.deepStrictEqual(one(vs, kpDig), { vals: vs, type: 'text' }, JSON.stringify(vs))
        })
        assert.deepStrictEqual(one(['9007199254740991', '1'], kpDig), { vals: [9007199254740991, 1], type: 'num' }) //安全整數上限仍可轉
    })

    //非數值: 文字、全形數字、NaN、布林、物件、陣列、純空白、混合欄 → 維持原值並使用 text(混合欄連數值部分也不轉)
    it('非數值與混合欄維持原值並使用text', function() {
        let obj = { a: 1 }
        let arr = [1, 2]
        let cases = [
            ['NP', 'SM'],
            ['９.５', '1'],
            ['NaN', '1'],
            [true, false],
            [obj, arr],
            [' ', '1'],
            ['9.5', 'NP'], //混合
            ['-', '12'], //混合
            [5, false], //混合
        ]
        cases.forEach((vs) => {
            let r = one(vs, { x: 1 })
            assert.strictEqual(r.type, 'text', JSON.stringify(vs))
            vs.forEach((v, i) => {
                assert.strictEqual(r.vals[i], v, `值須原樣: ${JSON.stringify(v)}`)
            })
        })
    })

    //空值: 空字串、null、undefined 不參與判型亦不被轉換; 全空欄不指定過濾器型別
    it('空值不參與判型且全空欄不指定', function() {
        assert.deepStrictEqual(one(['', '9.5', null, undefined, '8']), { vals: ['', 9.5, null, undefined, 8], type: 'num' })
        assert.deepStrictEqual(one(['', null, undefined]), { vals: ['', null, undefined], type: undefined })
    })

    //欄位鍵與 Object.prototype 成員同名(constructor、toString 等): 判為文字之欄不得被轉換, 轉換之欄名以自有標記為準
    it('保留名稱之欄位鍵不影響判型', function() {
        let names = ['constructor', 'toString', 'valueOf', 'hasOwnProperty']
        names.forEach((k) => {
            let rows = [Object.fromEntries([[k, 'BH-1']]), Object.fromEntries([[k, '17.0']])]
            let r = cvNumCols(rows, {})
            assert.deepStrictEqual(r.rows.map((o) => o[k]), ['BH-1', '17.0'], `${k} 文字欄須原樣`)
            assert.strictEqual(r.kpHeadFilterType[k], 'text', `${k} 應為 text`)
        })

        //kpDig 內無自有鍵時不得取到繼承成員
        assert.strictEqual(getIdig({ depth: 3 }, 'constructor'), undefined)
        assert.strictEqual(getIdig({ depth: 3 }, 'depth'), 3)
        assert.strictEqual(getIdig(null, 'depth'), undefined)
    })

    //輸入不被改動, 輸出為新的列物件
    it('不改動輸入且輸出為新物件', function() {
        let rows = [{ x: '9.5', y: 'NP' }, { x: '8', y: 'SM' }]
        let copy = JSON.parse(JSON.stringify(rows))
        let r = cvNumCols(rows, {})
        assert.deepStrictEqual(rows, copy)
        assert.notStrictEqual(r.rows[0], rows[0])
        assert.deepStrictEqual(r.rows, [{ x: 9.5, y: 'NP' }, { x: 8, y: 'SM' }])
        assert.deepStrictEqual(r.kpHeadFilterType, { x: 'num', y: 'text' })
    })

    //getCellText 與 w-aggrid-vue 預設儲存格文字化一致: 空值為空字串, 字串數字原樣, 物件/陣列 JSON, 循環參照空字串; 有 idig 且為有效數字(含十進位數字字串)時取位
    it('getCellText 文字化規則', function() {
        assert.strictEqual(getCellText(null), '')
        assert.strictEqual(getCellText(undefined), '')
        assert.strictEqual(getCellText('abc'), 'abc')
        assert.strictEqual(getCellText(12), '12')
        assert.strictEqual(getCellText({ a: 1 }), '{"a":1}')
        assert.strictEqual(getCellText([1, 2]), '[1,2]')
        let c = {}
        c.c = c
        assert.strictEqual(getCellText(c), '')
        assert.strictEqual(getCellText('15.274999999999999', 3), '15.275')
        assert.strictEqual(getCellText(0.4, 3), '0.400')
        assert.strictEqual(getCellText('NP', 1), 'NP') //有 idig 但非數字原樣
        assert.strictEqual(getCellText('', 1), '')
        assert.strictEqual(getCellText(null, 1), '')
    })

    //anaSptLiq(元件之分析入口): 表格拿轉型後之列; 繪圖狀態與分析結果列(rows, 供 zone-top 插槽)維持轉型前之原值
    //(getSts 以 isestr 判斷 legendCode 等字串欄, 若吃轉型後之數值會改以 USCS 推導圖例代碼, 例如夾具第1列 code 112 會變成 106)
    it('anaSptLiq 表格用轉型後之列, 繪圖與分析結果列維持原值', function() {
        let kpTrans = { 'SPTN': 'N60', 'Gt_dry': 'rd', 'Gt_sat': 'rsat', 'ctFine': 'FC', 'code': 'legendCode', 'USCS': 'soilClassification' }
        let rowsIn = getRowsLiqForColType().map((row) => {
            let r = {}
            Object.keys(row).forEach((k) => {
                r[kpTrans[k] || k] = row[k]
            })
            return r
        })
        let kpDig = { 'depth': 3, 'depthStart': 3, 'depthEnd': 3, 'N60': 1, 'WC': 1, 'PI': 1, 'LL': 1, 'S': 2, 'rd': 2, 'rsat': 2, 'D10': 5, 'D50': 5, 'FC': 1 }
        let kpHead = { 'depth': 'depth(m)', 'N60': 'N60', 'FC': 'FC(%)', 'rsat': 'rsat', 'rd': 'rd', 'WC': 'WC(%)', 'PI': 'PI(%)' }
        let opt = { unitSvSvp: 'MPa', methods: ['sptHBF2017', 'sptNJRA2017'], kpHead, kpDig, depthTitle: 'Depth(m)', geolayerWidth: 240, geolayerWaterLevel: 0.5 }
        let r = anaSptLiq(rowsIn, opt)

        //預期: 轉型前之列(計算結果, -err/-stateFS 欄已轉角括號為 HTML 實體)
        let raw = calcLiquefaction.calc('SPT', rowsIn, opt).map((o) => {
            let rr = {}
            Object.keys(o).forEach((k) => {
                rr[k] = isLongTextKey(k) ? String(o[k]).replace(/</g, '&lt;').replace(/>/g, '&gt;') : o[k]
            })
            return rr
        })

        //分析結果列: 同轉型前(depthStart 仍為文字)
        assert.deepStrictEqual(r.rows, raw)
        assert.strictEqual(typeof r.rows[0].depthStart, 'string')

        //繪圖狀態: 同以轉型前之列呼叫 getSts, 且第1列圖例代碼為輸入之 112(非 USCS 推導之 106)
        let sts = getSts(raw, kpHead, 'Depth(m)', 240, 0.5)
        assert.deepStrictEqual(JSON.parse(JSON.stringify(r.sts)), JSON.parse(JSON.stringify(sts)))
        let geo = r.sts.find((v) => v.key === 'Geolayer')
        assert.strictEqual(geo.item.data[0].legendCode, '112')

        //表格: depthStart 轉為數值並用 num; Ml 含 6.80 維持文字並用 text; 不含已移除之舊鍵
        assert.strictEqual(r.optTable.rows[0].depthStart, 0)
        assert.strictEqual(r.optTable.kpHeadFilterType.depthStart, 'num')
        assert.strictEqual(r.optTable.rows[2].Ml, '6.80')
        assert.strictEqual(r.optTable.kpHeadFilterType.Ml, 'text')
        let ks = Object.keys(r.optTable)
        ;['kpHeadRender', 'kpCellRender', 'kpCellTooltip', 'kpHeadTooltip'].forEach((k) => {
            assert.ok(!ks.includes(k), `optTable 不得含已移除之鍵 ${k}`)
        })
    })

})
