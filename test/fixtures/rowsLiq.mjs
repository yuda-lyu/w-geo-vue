//SPT液化分析輸入列夾具: 取自 src/AppZoneWSptLiqAnalysis.vue 之官方範例 rows2 前8列(鑽孔BH-1, 值皆為文字, 同使用端自資料庫取得之形態)
//getRowsLiq 回傳新物件, 各案例可自行改值而不互相影響


const BASE = [
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': '', 'depthStart': '0', 'depthEnd': '0.8', 'depth': '0.4', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Fill', 'SPTN': '5.333333333333333', 'GS': '2.7', 'WC': '25.9', 'Gt_sat': '18.82459459', 'Gt_dry': '14.3172973', 'LL': '34', 'PI': '14', 'D10': '0.0000', 'D50': '0.0142', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '6', 'ctSilt': '65', 'ctClay': '29', 'ctFine': '94', 'n': '', 'e': '0.85', 'S': '', 'code': '112', 'USCS': 'CL', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-1-2', 'depthStart': '0.8', 'depthEnd': '2', 'depth': '1.4', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Clay', 'SPTN': '5.333333333333333', 'GS': '2.7', 'WC': '25.9', 'Gt_sat': '18.82459459', 'Gt_dry': '14.3172973', 'LL': '34', 'PI': '14', 'D10': '0.0000', 'D50': '0.0142', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '6', 'ctSilt': '65', 'ctClay': '29', 'ctFine': '94', 'n': '', 'e': '0.85', 'S': '', 'code': '106', 'USCS': 'CL', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-2-2', 'depthStart': '2', 'depthEnd': '3.5', 'depth': '2.75', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Clay', 'SPTN': '6.666666666666667', 'GS': '2.74', 'WC': '33.6', 'Gt_sat': '18.88946809', 'Gt_dry': '14.29755319', 'LL': '38', 'PI': '15', 'D10': '0.0000', 'D50': '0.0113', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '1', 'ctSilt': '69', 'ctClay': '30', 'ctFine': '99', 'n': '', 'e': '0.88', 'S': '', 'code': '106', 'USCS': 'CL', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-3-3', 'depthStart': '3.5', 'depthEnd': '5', 'depth': '4.25', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Clay', 'SPTN': '5.333333333333333', 'GS': '2.73', 'WC': '34.7', 'Gt_sat': '18.64921875', 'Gt_dry': '13.94859375', 'LL': '39', 'PI': '17', 'D10': '0.0000', 'D50': '0.0105', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '1', 'ctSilt': '66', 'ctClay': '33', 'ctFine': '99', 'n': '', 'e': '0.92', 'S': '', 'code': '106', 'USCS': 'CL', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-4-2', 'depthStart': '5', 'depthEnd': '6.5', 'depth': '5.75', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Clay', 'SPTN': '2.6666666666666665', 'GS': '2.74', 'WC': '45.1', 'Gt_sat': '17.10461538', 'Gt_dry': '11.48692308', 'LL': '54', 'PI': '28', 'D10': '0.0000', 'D50': '0.0034', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '1', 'ctSilt': '38', 'ctClay': '61', 'ctFine': '99', 'n': '', 'e': '1.34', 'S': '', 'code': '106', 'USCS': 'CH', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-5-2', 'depthStart': '6.5', 'depthEnd': '8.4', 'depth': '7.45', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Clay', 'SPTN': '2.6666666666666665', 'GS': '2.66', 'WC': '69.9', 'Gt_sat': '16.37637097', 'Gt_dry': '10.52201613', 'LL': '79', 'PI': '46', 'D10': '0.0000', 'D50': '0.0035', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '1', 'ctSilt': '40', 'ctClay': '59', 'ctFine': '99', 'n': '', 'e': '1.48', 'S': '', 'code': '106', 'USCS': 'CH', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-6-2', 'depthStart': '8.4', 'depthEnd': '9.5', 'depth': '8.95', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Silt sand', 'SPTN': '26.666666666666668', 'GS': '2.74', 'WC': '21.5', 'Gt_sat': '19.24060773', 'Gt_dry': '14.85049724', 'LL': '-', 'PI': 'NP', 'D10': '0.0750', 'D50': '0.2642', 'Cu': '', 'Cc': '', 'ctGravel': '0', 'ctSand': '90', 'ctSilt': '5', 'ctClay': '5', 'ctFine': '10', 'n': '', 'e': '0.81', 'S': '', 'code': '227', 'USCS': 'SP-SM', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
    { 'projectNumber': 'PN:A01', 'holeId': 'BH-1', 'sampleId': 'S-7-2', 'depthStart': '9.5', 'depthEnd': '11', 'depth': '10.25', 'waterLevelUsual': '0.72', 'waterLevelDesign': '0.5', 'description': 'Silt sand', 'SPTN': '26.666666666666668', 'GS': '2.75', 'WC': '25.4', 'Gt_sat': '19.14016304', 'Gt_dry': '14.66168478', 'LL': '-', 'PI': 'NP', 'D10': '0.0750', 'D50': '0.2671', 'Cu': '', 'Cc': '', 'ctGravel': '3', 'ctSand': '87', 'ctSilt': '6', 'ctClay': '4', 'ctFine': '10', 'n': '', 'e': '0.84', 'S': '', 'code': '227', 'USCS': 'SP-SM', 'PGA': '0.32', 'Ml': '6.8', 'Mw': '7.1' },
]


//getRowsLiq, 回傳新的輸入列(深複製)
export function getRowsLiq() {
    return JSON.parse(JSON.stringify(BASE))
}


//getRowsLiqForColType, 另含易受轉型影響之文字值: 尾零(WC '17.0'有kpDig, Ml '6.80'無kpDig)、depth長小數
export function getRowsLiqForColType() {
    let rows = getRowsLiq()
    rows[1].WC = '17.0'
    rows[2].Ml = '6.80'
    rows[3].depth = '4.274999999999999'
    return rows
}


//getRowsLiqForDepthFloat, 3列連續土層(0~15.2, 15.2~15.35, 15.35~20): 第2列 depth 為 (15.2+15.35)/2 = 15.274999999999999(浮點誤差之長小數)
export function getRowsLiqForDepthFloat() {
    let rows = getRowsLiq().slice(0, 3)
    let bounds = [['0', '15.2'], ['15.2', '15.35'], ['15.35', '20']]
    rows.forEach((r, i) => {
        r.depthStart = bounds[i][0]
        r.depthEnd = bounds[i][1]
        r.depth = ''
    })
    return rows
}
