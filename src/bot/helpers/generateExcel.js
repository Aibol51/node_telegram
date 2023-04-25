const Excel = require('exceljs');

async function generateExcel(data) {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('统计数据');

  worksheet.columns = [
    { header: '日期', key: 'date', width: 12 },
    { header: '浏览量(PV)', key: 'pv', width: 12 },
    { header: '访客数(UV)', key: 'uv', width: 12 },
    { header: 'IP数', key: 'ip', width: 12 },
    { header: '跳出率', key: 'bounceRate', width: 12 },
    { header: '平均访问时长', key: 'avgVisitTime', width: 16 },
  ];

  data.forEach((dayData) => {
    worksheet.addRow(dayData);
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = generateExcel;
