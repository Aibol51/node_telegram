const htmlToImage = require("node-html-to-image");

async function generateImageFromTable(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
      font-family: Arial, sans-serif;
    }
    th, td {
      border: 1px solid #dddddd;
      text-align: center;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <th>日期</th>
      <th>浏览量(PV)</th>
      <th>浏览量(PV)昨日对比</th>
      <th>浏览量(PV)上周对比</th>
      <th>访客数(UV)</th>
      <th>访客数(UV)昨日对比</th>
      <th>访客数(UV)上周对比</th>
      <th>IP数</th>
      <th>IP数昨日对比</th>
      <th>IP数上周对比</th>
      <th>跳出率</th>
      <th>跳出率昨日对比</th>
      <th>跳出率上周对比</th>
      <th>平均访问时长</th>
      <th>平均访问时长昨日对比</th>
      <th>平均访问时长上周对比</th>
    </tr>
    ${data.map(row => `
  <tr>
    <td>${row.date}</td>
    <td>${row.pv}</td>
    <td>${row.comparePvYesterday >= 0 ? "昨日提升" : "昨日降低"} ${row.comparePvYesterday}%</td>
    <td>${row.comparePv >= 0 ? "上周提升" : "上周降低"} ${row.comparePv}%</td>
    <td>${row.uv}</td>
    <td>${row.compareUvYesterday >= 0 ? "昨日提升" : "昨日降低"} ${row.compareUvYesterday}%</td>
    <td>${row.compareUv >= 0 ? "上周提升" : "上周降低"} ${row.compareUv}%</td>
    <td>${row.ip}</td>
    <td>${row.compareIpYesterday >= 0 ? "昨日提升" : "昨日降低"} ${row.compareIpYesterday}%</td>
    <td>${row.compareIp >= 0 ? "上周提升" : "上周降低"} ${row.compareIp}%</td>
    <td>${row.bounceRate}</td>
    <td>${row.compareBounceRateYesterday >= 0 ? "昨日提升" : "昨日降低"} ${row.compareBounceRateYesterday}%</td>
    <td>${row.compareBounceRate >= 0 ? "上周提升" : "上周降低"} ${row.compareBounceRate}%</td>
    <td>${row.avgVisitTime}</td>
    <td>${row.compareAvgVisitTimeYesterday >= 0 ? "昨日提升" : "昨日降低"} ${row.compareAvgVisitTimeYesterday}%</td>
    <td>${row.compareAvgVisitTime >= 0 ? "上周提升" : "上周降低"} ${row.compareAvgVisitTime}%</td>
  </tr>
`).join('')}
  </table>
</body>
</html>
  `;

  const imageBuffer = await htmlToImage({ html, type: "png" });
  return imageBuffer;
}

module.exports = generateImageFromTable;
