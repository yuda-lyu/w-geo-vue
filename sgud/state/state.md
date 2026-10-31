# 狀態(現況)

本檔為當前已開發功能之最新狀態:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證或發布之版本.只記現況,不寫過程(過程寫入 `sgud/exp/experience.md`).

## 版本

- 最近發布版本:`1.1.11`(`package.json`;HEAD `0170de9`,2026-10-31).
- 工作樹現況(2026-11-01,geo34 修正輪,**尚未發布**,版本號未動):含 Gitea #34 之 `WSptLiqAnalysis` 繪圖參數自動勾選修正,以及 wsemi 1.9.36(有效數字 `isenum`)連動之 `getCellText`/`cvNumCols` 修正.
- 依賴:wsemi 1.9.36(`dig` 對非有效數字回空字串)、w-geo(`calcLiquefaction`)、w-table-vue 1.0.27、w-aggrid-vue 2.1.9、w-component-vue、w-highcharts-vue.

## 功能與狀態

| 功能 | 狀態 | 規則帳本 | 測試 |
|---|---|---|---|
| `WSptLiqAnalysis` 表格(欄名/取位/提示經 `WTableEdit` slot,數值欄轉型,過濾器) | 完成 | R01~R04 | `test/e2e-liq-analysis.test.mjs`、`test/unit-cvNumCols.test.mjs` |
| `WSptLiqAnalysis` 分析例外攔截(錯誤訊息 + `error` 事件,首次只發一次) | 完成 | R05 | 同上(R05 三案、E2E-015) |
| `WSptLiqAnalysis` 繪圖參數自動勾選(新勾選方法之 FS/PL/stlTS/stlIY 自動勾選並繪圖,取消則移除;使用者選擇維持) | 完成(geo34 修正,待主控複審與發布) | R06 | `test/unit-getKeyStsSelects.test.mjs`、`test/e2e-liq-analysis.test.mjs`(E2E-010~015) |
| 儲存格取位只對有效數字(`'0x10'`、`Infinity`、`'1e400'` 照原樣文字,不為空字串) | 完成(geo34 修正) | R03、R04 | `test/unit-cvNumCols.test.mjs` |
| 其餘元件(`WSoilColumn`、`WSoilColumnWithAnchors`、`WSptLiqPlotDepth(s)`、`WSptLiqPlotDepthsWithGrades(AndTools)`、`WPlot2d`) | 無自動測試(僅 `src/AppZone*.vue` 範例頁人工檢視) | 無 | 無 |

## 已知缺口與待辦

- `kpDig` 之位數值須為非負整數:wsemi 1.9.36 之 `dig` 對 `idig` 不是 `isp0int`(如 `'3'`、`1.5`、負數)回傳空字串,使用端若給此類值該欄整欄空白;本套件預設值皆整數,未加防護(僅記錄,屬使用端輸入)。
- 數值過濾比對儲存格原值,非畫面取位值(R04 已知限制);`-err`/`-stateFS` 欄資料為 HTML 實體字串(R03 已知限制);`defCellAlighH` 拼錯鍵已移除未改正(R01,畫面維持置中).
- 取消勾選全部繪圖參數後,不再自動恢復預設勾選(舊行為為立即恢復預設,不可能全取消);此為 geo34 附帶之行為變更,見 R06.
- 僅 `WSptLiqAnalysis` 有 e2e;其餘元件無測試,擴充時依 `sgud/rule/rulebook.md` 之 e2e 映射慣例(宿主頁 `test/pages/`、建置待測 UMD).

## 最近一次驗證

- 2026-11-01 geo34(工作樹,版本號未動):全套 `npm test`(`quiet-run --lock`)45 passing、0 failing(`test/all.test.mjs` 1 + `unit-cvNumCols` 12 + `unit-getKeyStsSelects` 8 + `e2e-liq-analysis` 24);R06 對 HEAD(修前)10 案轉紅 7 案、對修後 10 案全綠;6 個 A 部分變異與 2 個 B 部分變異除 1 個等價變異外皆轉紅.詳見 `C:\opensrcOper\dnow\20261031234910\agent-out\geo34-修正報告.md`.
- 本套件無 pixel baseline,標準圖 0 張變動.
