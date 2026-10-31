# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

以[規則]為單位(不以缺陷站點為單位).每條附:規則,盤點指令(可重跑),站點全集與判準(已套/未套/刻意不套),對應測試.

## 依賴鏈事實(2026-10-20 實證)

- `WSptLiqAnalysis` → `w-table-vue` 1.0.27 之 `WTableEdit` → `w-aggrid-vue` 2.1.9 之 `WAggridVue`.
- `WTableEdit` 對 `cell-render`、`cell-tooltip`、`head-render`、`head-tooltip` 四個 scoped slot 皆有轉傳(`node_modules/w-table-vue/src/components/WTableEdit.vue` 之 `v-if="$scopedSlots['…']"` 守衛),故本套件改用 slot 不需 w-table-vue 配合.
- `w-aggrid-vue` 2.0.56 起移除 `opt.kpCellRender/kpCellTooltip/kpHeadRender/kpHeadTooltip`,2.1.9 偵測到舊鍵僅 `console.warn` 一次,不再套用.
- slot 為整表單一份(非逐欄):`head-render` 與 `cell-render` 對每個欄位、每個儲存格呼叫,以 `props.key` 分流;提供 slot 後該表所有儲存格皆走 `CellSlotRenderer`(`h('span', vnodes)`,不再是 ag-grid 之字串 innerHTML 路徑).`head-render` 之 `props.value` 為 ag-grid 之 displayName(有 kpHead 者為其標題,否則為欄位鍵字面).
- `cell-tooltip` slot 一旦提供,每個儲存格皆掛 `onmouseenter="ttWAggridVue(this,'<md5>')"`;slot 回傳空內容時 md5 為空字串,`ttWAggridVue` 之 `isestr(kmsg)` 檢查擋下,不彈出任何提示(2026-10-20 實測:游標停在 depth、sampleId 儲存格,`onmouseenter` 之參數為 `''`,`.tippy-box` 數量為 0).故以 `v-if` 只對 -err/-stateFS 欄回傳內容即可逐欄控制,非目標欄無副作用.(初判「空內容會退回 ele.innerHTML 而全表出現提示」為誤,已實測推翻並以 e2e 負向案固定.)
- 修前(`07e037a`)字串型儲存格值經 ag-grid 之 cellRenderer 函數回傳字串 → 以 HTML 解析,故修前任何欄位之值含 `<b>` 皆被當 HTML(實測 `a<b>bold</b>c` 得 `<span>a<b>bold</b>c</span>`);修後 `cell-render` 以 `v-html` 維持同語意(僅外層多一層 span).此為既有特性,不在本次改動.
- `WTableEdit` 以 `opt` 控制表格;`optionsTable` 以 `v-bind` 傳為 WTableEdit 之額外屬性,無法注入 `opt` 內之鍵(顯式 `:opt` 優先),故 `kpCellFormat` 等 opt 鍵使用端不可達.
- `calcLiquefaction.calc` 對空陣列拋「無有效數據」;對 PGA 非數值拋 `rows[0].PGA or opt.PGA is not a number`;土層深度不連續亦拋.

## 規則

### R01 不得向 WTableEdit 傳入 w-aggrid-vue 已移除之舊鍵

- 規則:`optTable` 不含 `kpHeadRender`、`kpCellRender`、`kpCellTooltip`、`kpHeadTooltip`;欄名/儲存格/提示之客製一律以 `WTableEdit` 之 scoped slot 實作.開頁 console 無 `was removed in 2.0.56`.
- 盤點:`rg -n "kpHeadRender|kpCellRender|kpCellTooltip|kpHeadTooltip" src`(僅允許出現在說明註解)
- 站點全集(2026-10-20 修前):`src/components/WSptLiqAnalysis.vue` 1 檔(3 鍵);其餘 `src/` 元件 0(`WPlot2d` 用 `w-highcharts-vue`,其餘僅用 `w-component-vue` 之 WIcon/WCheckbox/WButtonChip/WSwitch/WSlider/WLevelGrade/WSegmentsVertical,依賴套件原始碼皆查無 removed/deprecated 標記).`dist/`、`docs/` 為建置產物,不在盤點.
- 同型問題(依賴套件靜默忽略之設定鍵)盤點:`anaSptLiq` 之 `defCellAlighH: 'left'` 為 `defCellAlignH` 之拼錯,被忽略(畫面實為置中,修前修後皆然);改正會使全表對齊由置中變靠左,屬既有 UI 變更.**主控 10-20 裁示:移除該拼錯鍵、不改正**(維持置中,不動使用端標準圖;`anaSptLiq.mjs` 註解載明).另主控裁示:HTML 解析呈現、`-err`/`-stateFS` 實體字串、數值過濾比原值皆維持現狀,於元件 JSDoc 載明;空 rows 不算錯誤採納.其餘傳給表格之鍵(`keys`、`rows`、`defHeadSortMethod`、`defCellEditable`、`kpHead`、`kpHeadFilterType`)皆為 w-table-vue/w-aggrid-vue 有效鍵.
- 判準:已套=0 處舊鍵;未套=有舊鍵.
- 測試:`test/e2e-liq-analysis.test.mjs` 之 R01 案;`test/unit-cvNumCols.test.mjs` 之 anaSptLiq 案(optTable 不含舊鍵).

### R02 欄名依 kpHead 以 HTML 渲染,無對應者為字面文字

- 規則:`head-render` slot 對 `useKpHead` 有鍵之欄(自有鍵,`hasHeadHtml`)以 `props.value`(欄名,已含 `<sub>`、`<sup>`)為 HTML 渲染;無對應 kpHead 之欄位鍵以文字插值呈現(同修前未經 kpHeadRender 之預設表頭).`{unitSvSvp}` 先取代(`useKpHead`);`m2/m3` 轉上標(`spc2html`).
- 盤點:`rg -n "head-render|hasHeadHtml" src`;e2e 檢表頭 `sub`/`sup` 元素存在且表頭文字不含 `<sub>`.
- 測試:R02 兩案(映射欄 rsat 有 sub/sup;無映射之 `custom<sup>x</sup>` 欄維持字面).

### R03 儲存格依 kpDig 取位;-err/-stateFS 欄提示

- 規則:`cell-render` slot 對 `kpDig` 自有鍵所列欄位,值為**有效數字**(`isenum`:有限數字,或去頭尾空白後為十進位寫法之數字字串)時以 `dig(v, idig)` 取位;其餘值原樣(空/null 為空字串,物件字串化),與 w-aggrid-vue 預設 `cvCellText` 同文.十六進位/八進位/二進位字樣(`'0x10'`)、`Infinity`、溢位科學記號(`'1e400'`)不屬有效數字(使用者 2026-10-31 裁定,wsemi 1.9.36 起 `dig` 對其回傳空字串),**不取位、照原樣當文字顯示,不得顯示為空字串**(判斷在 `getCellText` 內以 `isenum` 為之,不依賴 `dig` 之回傳).`-err`、`-stateFS` 欄之值先 `escapeHTML`,以 `v-html` 呈現(顯示字元與修前一致),`cell-tooltip` 對此二類欄回傳同值.
- 單一擁有者:取位與文字化之函數 `src/js/getCellText.mjs`(slot 與 R04 之顯示不變檢查共用,不得各寫一份);取 kpDig 位數之 `src/js/getIdig.mjs`(只取自有鍵,不取 constructor 等繼承成員);-err/-stateFS 判準 `isLongTextKey`(`src/js/anaSptLiq.mjs`,escape 與提示共用).
- 逐欄控制:`cell-tooltip` 以 `hasCellTooltip(props.key)`(即 `isLongTextKey`)為 `v-if`,只對 -err/-stateFS 欄回傳內容.
- 已知限制:-err/-stateFS 欄之資料為 HTML 實體字串(修前即如此,影響匯出值與 `rows` 插槽),故該欄之文字過濾比對的是實體後之字串(輸入 `&lt;` 可比對 `<`;不含角括號之片段如 `PI[14]` 可直接比對).改為存原文再於呈現層編碼會連動改變匯出值與 `rows` 插槽,屬另案,留使用者裁示.
- 測試:R03 三案(depth 取位;-stateFS 提示含 `<`、`>` 原字元且 depthStart 欄無提示;-err 提示);R03/R04 全欄顯示文字案(對照獨立期望,涵蓋所有欄).

### R04 表格數值欄須以數值傳入,文字欄逐欄指定文字過濾器

- 規則:`anaSptLiq` 輸出列交給表格前,逐欄判型(`src/js/cvNumCols.mjs`):①欄內非空值皆為數值或**有效數字字串**(`isenum`,與 R03 `getCellText` 取位之判斷為同一定義),且轉成數值後的顯示文字(含 kpDig 取位)與轉前逐格相同,且絕對值不超過安全整數上限(超過 2^53 之整數維持文字,避免失精度)→ 該欄轉為數值,過濾器 `'num'`;②其餘有非空值之欄 → 值原樣,過濾器 `'text'`;③全空欄不指定(沿用表格預設之數值過濾器,無資料故無實質影響).顯示值不變為硬約束(由 `getCellText` 計算轉前後顯示文字比對,不變才轉).有 kpDig 之欄,有效數字字串取位前後之顯示文字必然相同,保障來自取位本身;無 kpDig 之欄才實際比對字面(尾零、前導零、前後空白、科學記號、正負號者維持文字).**十六進位/八進位/二進位字樣(`'0x10'`)、`'Infinity'`、`'1e400'` 等非有效數字之字串,不論有無 kpDig 皆維持文字欄(值原樣、顯示原樣)**;原生數值(含 `Infinity`)無須轉換,值與顯示不變(`Infinity` 顯示為 `Infinity`).(2026-11-01 wsemi 1.9.36 連動:先前有 kpDig 之 `'0x10'` 欄轉為 16 顯示 `0`,現依有效數字定義維持文字;`isenum` 之判斷與既有 `isSafeNum`、顯示比對對現有輸入互為冗餘〔變異驗證為等價變異〕,保留為單一定義之防線.)
- **轉型範圍**:轉型後之列只給表格(`optTable.rows`)使用;繪圖狀態(`getSts` 以 `isestr` 判斷 `legendCode` 等字串欄,吃轉型後之數值會改以 USCS 推導圖例代碼,夾具第 1 列 code 112 會變成 106)與分析結果列(`rowsResult`/`zone-top` 插槽之 `rows`)維持轉型前之原值.
- 取捨:不採「全欄無條件轉數值」(`6.80`→`6.8` 會改顯示字面);不採「只逐欄指定 text 過濾器」(失去 >、<、範圍等數值比較).被保留為文字之欄(如含 `NP`、`-`、尾零且無 kpDig)改用文字過濾器(包含比對).
- 行為變化:轉為數值之欄,匯出檔中該欄為數值儲存格(數值相等,顯示不變);有 kpDig 之欄之尾零字面(如 `0.0750`)於匯出檔變為數值 `0.075`(顯示仍由 kpDig 取位為 `0.07500`).排序不變:w-aggrid-vue 之 'auto' 排序對數值字串本即為數值比較(2026-10-20 實測:拿掉轉型,點表頭排序之結果仍為數值大小),故轉型不改變排序語意(排序案為守門用,非轉型敏感).
- 已知限制:數值過濾比對的是儲存格原值,非畫面取位值(depth 為 15.274999999999999、畫面顯示 15.275 時,輸入 15.275 得 0 列);此為 ag-grid 過濾讀原值之既有特性,對原本即為數值之欄(如 depth)修前亦同,若改為轉型時取位會改變匯出值,不採.
- 盤點:`rg -n "kpHeadFilterType" src`;e2e 於過濾列輸入驗證.
- 測試:R04 e2e 五案(depthStart 文字 "9.5" 過濾得 1 列且 WC 17.00 等值;文字欄過濾;排序;匯出值);`test/unit-cvNumCols.test.mjs` 十二案(值型別軸、保留名稱、輸入不變、getCellText、anaSptLiq、有 kpDig 之 `0x10`/`0X1F`/`0b11`/`0o7` 維持文字且顯示原樣、`Infinity`/`-Infinity`/`1e400` 不取位顯示原樣).
- 站點盤查(2026-11-01,`rg -n "dig\(" src`;wsemi 1.9.36 起 `dig` 對非有效數字回傳空字串,故逐站確認輸入):`src/js/getCellText.mjs`(輸入為任意儲存格值,可為十六進位字串/Infinity → 已改 `isenum` 判斷);`src/components/WSoilColumn.vue:262-266`(`n = cdbl(v)` 後才 `dig`,`cdbl` = `isnum` 否則 0,否則 lodash `toFinite`:`'0x10'`→16、`Infinity`/`'1e400'`→±1.7976931348623157e308,恆為有限數 → 不需改;實測 2026-11-01:`dig(cdbl('0x10'),1)`='16.0'、`dig(cdbl('abc'),1)`='0.0';輸入為 Infinity 時被夾為 ±1.797e308,`dig` 得 `'NaN'`——新舊 wsemi 相同、非空字串,屬輸入已不合理之深度,不在本次連動);`src/components/WSptLiqPlotDepthsWithGrades.vue:303,335`(`value = cdbl(value)` 後才 `dig`,同上恆為有限數 → 不需改);`src/js/getDefAxis.mjs:50`(`this.value` 為 Highcharts 線性軸刻度:刻度僅在 `isNumber(min)&&isNumber(max)` 時產生〔`node_modules/highcharts/es-modules/Core/Axis/Axis.js:1603`〕,`isNumber` 排除 ±Infinity/NaN〔`Core/Utilities.js:370-372`〕→ 恆為有限數,不需改).新增 `dig` 站點時須先確認輸入恆為有限數,或先以 `isenum` 判斷.

### R05 analysis 例外須攔截,元件內顯示並發 error 事件

- 規則:`analysis` 內任何例外 → 清空 `optTable`/`rowsAna`/`sts`(不留舊結果),設定錯誤訊息並於元件內顯示(`role="alert"`,沿用既有色票 `#f26` 強調),`$nextTick` 後(元件未銷毀時)`$emit('error', err)`;下一次分析成功時清除錯誤訊息.不使用 alert/confirm/prompt.輸入 rows 為空陣列(使用端資料載入前之常態)視為尚無數據:不計算、清空結果、不顯示錯誤、不發事件.
- 首次渲染即以 prop 之方法勾選為初值(`sptMethodsSelectsTrans: this.sptMethodsSelects`),不先以空方法分析一次再重算;否則首次即帶錯誤資料掛載時同一錯誤會發出兩次 error 事件.
- 每次分析失敗發出一次(勾選方法變更而重新分析且仍失敗者會再發出一次).
- 盤點:`rg -n "analysis\(" src/components/WSptLiqAnalysis.vue`(唯一呼叫點 `changeRowsTrans`);`rg -n "\$emit\('error'" src`.
- 測試:R05 三案(PGA 空 → 見錯誤訊息、收到 error 事件、成功→失敗→成功→失敗之清理含繪圖區、成功→空列;首次即帶錯誤資料只發一次;首次即帶正常資料).

### R06 新勾選之分析方法,其參數自動勾選並繪圖;取消勾選則移除(Gitea #34)

- 規則:`WSptLiqAnalysis` 之已勾選繪圖參數 `keyStsSelects` 由 `changeStsAndKeyParamSelects` 依 `src/js/getKeyStsSelects.mjs`(純函數,單一擁有者)維護:①首次出現(前次鍵集 `stsKeysPrev` 為空)與日後**新出現**之參數鍵(新勾選方法之 `-FS`、`-PL`、`-stlTS`、`-stlIY`,及 `-cmpFS` 等符合 `keyParamSelects` 者)自動加入;②**已消失**之鍵(取消勾選方法)自 `keyStsSelects` 移除,再次勾選視為新出現而重新自動勾選;③前後皆存在之鍵維持使用者之勾選結果(使用者取消勾選之參數不因勾選其他方法而恢復;使用者全部取消後不恢復預設);④`sts` 為空(尚無資料或分析失敗)時不變更、保留前次鍵集(失敗後復原不重設使用者之勾選);⑤未勾選任何方法(`hasSelects` 為 false)時 `keyStsSelects` 與 `stsKeysPrev` 清空,不依其(全方法)分析結果判斷.未變更時不寫回(參照比較),避免 computed 因自身依賴被寫入而重複觸發.
- 根因(1.0.56 → 1.1.x 迴歸):1.0.56 之 `sptMethodsSelectsTrans` 初值為 `[]`,首次分析以空方法陣列呼叫 `calcLiquefaction`,而 `node_modules/w-geo/src/calcLiquefaction.mjs:7980-7984` 對 `size(methods)===0` 改用**全部方法**,故 `sts` 含全部 7 法之鍵(77 項),`changeStsAndKeyParamSelects` 一次把全部方法之 `-FS/-PL/-stl*` 預先勾好,其後新勾選之方法其鍵早已在 `keyStsSelects` 內;1.1.x 為使首次渲染只分析一次(R05)把初值改為 prop,首次 `sts` 只含實際勾選之方法(2 法 37 項、勾 12 鍵),而 `changeStsAndKeyParamSelects` 之「`keyStsSelects` 非空即不再變更」(舊 `WSptLiqAnalysis.vue:466`)使日後新出現之鍵(sptTY 之 4 鍵,45 項)永不勾選.(隱性依賴:自動勾選全賴「首次分析含全部方法」之副作用,非明確設計.)
- 與 R05 之關係:首次渲染只分析一次之行為不變(`sptMethodsSelectsTrans: this.sptMethodsSelects`);修正只動勾選維護,不動分析路徑.
- 盤點:`rg -n "keyStsSelects|stsKeysPrev|getKeyStsSelects" src`(元件唯一寫入點為 `changeStsAndKeyParamSelects`;使用者勾選參數經子元件 `update:keyStsSelects` 以 `.sync` 寫回,合於③).
- 測試:`test/unit-getKeyStsSelects.test.mjs` 八案(首次、新勾選/取消/再勾選、使用者選擇維持、全取消不恢復、sts 為空、同一參照、過濾設定、輸入不變);`test/e2e-liq-analysis.test.mjs` 之 E2E-010~015(掛載 sptSeed 之 4 參數已勾並有圖;真滑鼠勾選/取消勾選 sptTY〔不寫回與 `.sync` 寫回〕;掛載後使用端改 prop;掛載時無資料其後給 rows;使用者選擇維持與全取消再勾選;分析次數〔首次一次、每次勾選一次、prop 改變一次、錯誤資料首次只發一次 error〕).
- 變異驗證(把各修正拿掉須轉紅,2026-11-01 全數轉紅〔b2 為等價變異〕,腳本 `session.mjs` 隨修正報告存於證據夾 `C:\opensrcOper\dnow\20261031234910\agent-out\geo34-evidence\`,非版控):未重設(m1,E2E-014 轉紅)、保留已消失之鍵(m2,E2E-011×2、E2E-012 與單元轉紅)、只在首次加入(m3,即修前行為,e2e 7 案與單元 3 案轉紅)、前次鍵集不更新(m4,E2E-014 與單元 3 案轉紅)、初值為空陣列(m5,R05 首次只發一次 error 與 E2E-015×4 轉紅)、無 `hasSelects` 防護(m6,E2E-014 轉紅).B 部分:`getCellText` 改回 `isnum`(b1,兩案轉紅);`cvNumCols` 改回 `isnum`(b2,**等價變異**:`isSafeNum` 與顯示比對已對所有非有效數字字串判為文字,`isenum` 僅為單一定義之防線,找不到可區分之輸入).
- 修前紅(HEAD 之 components 跑同一組 R06 測試):10 案中 7 案轉紅(勾選/取消勾選 sptTY ×2、掛載後改 prop、使用者選擇維持、分析次數 ×3 之後半段〔皆因 sptTY/sptSeed 之參數未勾〕),**掛載即 sptSeed、掛載時無資料、首次錯誤資料只發一次 3 案修前即綠**——即「以 `sptMethodsSelects:['sptSeed']` 掛載」之驗證建議 1 在修前不重現,故障路徑為掛載後才新增之方法.
- 判準:已套=新勾選之方法其 4 參數已勾並有圖;未套=新勾選方法之參數出現於參數區但未勾.

## e2e 映射(角色:套件元件庫,真瀏覽器 + mocha,無 pixel baseline)

- 測試檔:`test/e2e-liq-analysis.test.mjs`(14 案 + R06 之 10 案)、`test/unit-cvNumCols.test.mjs`(12 案)、`test/unit-getKeyStsSelects.test.mjs`(8 案);工具:`test/tools/e2eLib.mjs`(橋接 w-package-tools-e2e)、`test/tools/e2e-setup.mjs`(建置 UMD 到 `test/_tmp/liq-analysis/`、開頁、表格讀取與捲動原語);宿主頁 `test/pages/liq-analysis.html`(in-DOM 模板,prop 須用 kebab-case;`window.__nAna` 為元件 `analysisCore`〔舊版 `analysis`〕呼叫次數,由 `Vue.mixin` 於元件建立前包裝;`window.__updMethods`/`window.__syncMethods` 記錄 `update:sptMethodsSelects` 並可如 `.sync` 寫回 prop,該事件因 DOM 模板無法寫 camelCase 而以 `$on` 掛接);夾具 `test/fixtures/rowsLiq.mjs`;畫面判讀原語(`test/tools/e2e-setup.mjs`):`checkboxStates`〔WCheckbox 以圖示路徑判已勾〕、`checkboxLocator`、`plotNames`〔圖例文字 = 參數 key;值軸標題只是 FS/PL/Settlement(m) 通稱,不可用來辨識是哪個方法之圖〕、`plotCount`、`compState`.參數勾選區顯示文字與 sts key 不同者:`All-cmpFS` 顯示為 `Compare-FS`.
- 建置:測 `src/` 之現況,`before` 以 `w-package-tools/src/rollupFiles.mjs` 建 `WGeoVue.vue` 到 `test/_tmp/liq-analysis/`(不覆寫版控之 `dist/`),`after` 刪除.環境變數 `E2E_SRC_COMPONENTS` 可改指另一份 components 資料夾(變異驗證/修前紅用).
- 單檔執行:`node C:/opensrcOper/tools/quiet-run.mjs --lock --timeout 900 -- npx mocha test/e2e-liq-analysis.test.mjs --timeout 180000`(單元測試無需 `--lock`).
- 不使用 pixel baseline 之理由:本次各項皆為文字/事件/DOM 語意可斷言之行為,且畫面含 Highcharts 繪圖與字型,無穩定視覺態需求;偏離登錄於此.
- act 層級:輸入走真鍵盤(過濾列)、hover 與點擊走真滑鼠(表頭排序、下載鈕、儲存格 hover、方法與參數勾選框 `locator.click()`);換 rows、首次掛載資料(`addInitScript`)、使用端改 `sptMethodsSelects` prop 屬 setup(經宿主頁 `__vm`/`__initRows`/`__initMethods`,不屬 act).
- 一次鎖內序列跑完整輪驗證:全庫並行時 `--lock` 佇列可達 8~10 條(2026-11-01 等了 39 分),把「單元 + 全 e2e + 修前紅 + 變異 + 全套」寫成單一腳本以 `nohup` detached 在一次鎖內跑完(背景指令有 10 分鐘上限,排鎖不可掛在工具呼叫上).
- 變異驗證(把各修正拿掉須轉紅,2026-10-20 全數轉紅,腳本在 `tmp/mutate.mjs`,非版控):舊鍵、head slot、head HTML 範圍、取位、tooltip slot、tooltip 逐欄 v-if、轉型、有損轉型、過濾器型別、無 catch、無 emit、不清錯誤、空列算錯誤、文字取代 v-html、kpDig 之 idig、保留名稱、安全數值守衛、idig 繼承成員、sts 吃轉型列、rows 吃轉型列、catch 不清 sts、方法初值為空、空列不清 sts.
