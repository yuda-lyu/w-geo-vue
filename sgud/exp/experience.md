# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## WSptLiqAnalysis 之表格(2026-10-20,issue #8 修正)

- 依賴鏈:`WSptLiqAnalysis` → `WTableEdit`(w-table-vue)→ `WAggridVue`(w-aggrid-vue).改表格之欄名/儲存格/提示一律用 `WTableEdit` 之 scoped slot(`head-render`、`cell-render`、`cell-tooltip`;`WTableEdit` 以 `v-if="$scopedSlots[…]"` 守衛轉傳);舊 `opt.kpHeadRender/kpCellRender/kpCellTooltip/kpHeadTooltip` 於 w-aggrid-vue 2.0.56 起已移除,只印警告不套用.
- slot 是整表單一份,對每個欄位/儲存格呼叫,須以 `props.key` 分流;一旦提供 `cell-render`,全表儲存格走 `CellSlotRenderer`(Vue vnode),不再是 ag-grid 之字串 innerHTML 路徑,故原本字串即 HTML 之值(`-err`/`-stateFS` 已 `escapeHTML`)須以 `v-html` 才與修前顯示相同.
- `cell-tooltip` slot 回傳空內容不會彈提示(空內容 md5 為空字串,`ttWAggridVue` 之 `isestr(kmsg)` 擋下),用 `v-if` 可逐欄控制.實測推翻了「空內容會退回儲存格文字而全表出現提示」之初判.
- 數值過濾:w-aggrid-vue 預設 'num' 過濾器(`agNumberColumnFilter`)比對文字值得 0 列;浮動過濾列之輸入框為 `type=number`,所以文字欄在 'num' 下根本打不進字.逐欄過濾型別走 `opt.kpHeadFilterType`(`WTableEdit` 會把 opt 其餘鍵轉給 w-aggrid-vue).
- `calcLiquefaction.calc` 對空陣列拋「無有效數據」:宿主以 `rows=[]` 掛載(資料尚未載入)即會拋;修前為 Vue render error 噪音,修後視為尚無數據不計算.計算端對 PGA 非數值、土層深度不連續等亦拋.
- `defCellAlighH: 'left'`(`anaSptLiq` 之 optTable)為 `defCellAlignH` 之拼錯,被依賴套件忽略,畫面實為置中(修前修後皆然).改正會使全表對齊由置中變靠左,屬既有 UI 變更,未擅改,留使用者裁示.
- 專案原始檔為 CRLF(`.editorconfig` end_of_line=crlf);用腳本改檔須保持 CRLF,以 Edit/Write 工具則已維持.

## 繪圖參數自動勾選與 wsemi 有效數字(2026-11-01,issue #34 與 wsemi 1.9.36 連動)

- **隱性依賴要先挖出來再動初值**:1.0.56 之「新勾選方法自動勾選其參數」並非明確設計,而是 `sptMethodsSelectsTrans` 初值為 `[]` → `calcLiquefaction` 把空方法陣列當「全部方法」(`w-geo/src/calcLiquefaction.mjs:7980-7984`)→ 首次 `sts` 含 7 法 77 項 → 全部方法之 `-FS/-PL/-stl*` 一次預勾.後來為「首次只分析一次」把初值改成 prop,預勾範圍縮到實際勾選之方法,自動勾選就壞了而無任何測試守住.教訓:改初值/預設前,先查該值為空時下游函數之行為(空 = 全部?),並為「依賴該副作用之功能」補測試.
- 修法選差異式維護(`getKeyStsSelects`:新出現鍵加入、已消失鍵移除、既有鍵維持使用者選擇),不選「把初值改回 `[]`」(違反首次只分析一次),也不選「每次分析結果覆蓋勾選」(丟掉使用者選擇).沒有勾選任何方法時 `calc` 仍以全部方法計算(結果不顯示),此時不可拿 `sts` 判斷新出現,否則全方法之鍵會被視為舊有.
- Vue 2 有副作用之 computed(`changeRows`、`changeRowsTrans`、`changeSptMethodsSelects`、`changeStsAndKeyParamSelects` 以樹根 div 之屬性綁定於同一次渲染依序求值)會有「同一輪渲染內讀到上一輪 `sts`」之過渡態:改 prop 時 `changeSptMethodsSelects` 在 `changeRowsTrans` 之後才求值,所以同一輪 `hasSelects` 已更新而 `sts` 仍舊.讀 `sts` 之邏輯須對「鍵集不變」無副作用(差異式維護天然滿足),寫回須先比對參照,否則 computed 因自身依賴被寫入而反覆觸發.
- 驗 `keyStsSelects` 不夠,要驗使用者看得到的:WCheckbox 之已勾判斷用圖示 `svg path[d=mdiCheckboxMarked]`(未勾為 `mdiCheckboxBlankOutline`,皆 import 自 `@mdi/js`);圖有無用 `.highcharts-container .highcharts-axis-title` 之文字(參數圖之值軸標題即 key,`useHTML:true`);定位 WCheckbox 根節點用 `div[tabindex="0"]` 加全文字錨定正則,不用 `getByText`(同字會命中表頭、軸標題).
- in-DOM 模板(宿主頁 `test/pages/liq-analysis.html`)無法寫 camelCase 事件名,監聽 `update:sptMethodsSelects` 須程式 `$on`;分析次數以全域 `Vue.mixin` 在 `beforeCreate` 包裝 `$options.methods.analysisCore`(須在 `Vue.use` 之前註冊;舊版無 `analysisCore` 則包 `analysis`),空列也會計次(提早返回).
- `WSptLiqAnalysis.vue` 工作樹為 CRLF(索引為 LF,`core.autocrlf=true`),Edit 工具會保留;以腳本做變異/替換多行字串時須先轉 CRLF 再比對.`git ls-files --eol` 可看,不要用 `grep -c $'\r'`(工具引號處理會得 0).
- wsemi 1.9.36 起 `dig` 以 `isenum` 檢測輸入,非有效數字(`'0x10'`、`Infinity`、`'1e400'`、`'-'`、`''`、null)回傳空字串:呼叫 `dig` 前須先確認輸入恆為有限數(如先 `cdbl` 再 `dig`;`cdbl` 為 `isnum` 否則 0,否則 lodash `toFinite`,恆有限),或先以 `isenum` 判斷、不通過者走原樣文字.`dig` 之第二參數 `idig` 亦須為非負整數(`isp0int`),否則回傳空字串——使用端 `kpDig` 給非整數/字串位數會整欄空白(本套件預設值皆整數;未處理,僅記錄).
- 全庫並行時 `quiet-run --lock` 佇列可達 8~10 條、等候 1 小時級;背景指令有 10 分鐘上限,排鎖必須 `nohup` detached;把「單元 + 全 e2e + 修前紅 + 變異 + 全套」寫成單一 session 腳本在一次鎖內序列跑完,可把排隊次數壓到一次(各階段 log 於 `tmp/geo34/log-*.txt`).

## e2e(`test/e2e-liq-analysis.test.mjs`)

- 建置待測物:`test/tools/e2e-setup.mjs` 之 `buildUmd` 以 rollup 建 `WGeoVue.vue` 到 `test/_tmp/liq-analysis/`(約 15~20 秒,不覆寫版控 `dist/`);環境變數 `E2E_SRC_COMPONENTS` 指向另一份 components 資料夾可測副本(變異驗證/修前紅;副本須在專案根之下以解析 node_modules,如 `tmp/mut-xxx/src/components`,其 `../js` 一併複製).
- ag-grid 浮動過濾格無 `col-id`,以與表頭相同之 `aria-colindex` 對應;欄寬固定 200px 且欄位虛擬化,表頭欄位須以真滑鼠滾輪水平捲動(`scrollToCol`)才渲染.
- `waitRowCount` 若沿用前一個過濾之結果會立即成立而假綠:換過濾值前先清空並等回全列數.
- 讀下載之 xlsx:`getDataFromExcelFileU8Arr` 預設 `valueToString:true` 一律字串,要分辨數值/文字須傳 `valueToString:false`.
- 同時多 agent 共用 web 測試鎖(`quiet-run --lock`)會等 20~80 秒;外審與變異驗證可與 e2e 並行(外審不用鎖).
- 變異驗證腳本放 `tmp/`(非版控);13 個變異(各修正拿掉)全數轉紅,見修正報告.
