const axios = require("axios");

async function requestData(siteId, startDate, endDate, userName, accessToken) {
  const payload = {
    header: {
      userName: userName,
      accessToken: accessToken,
    },
    body: {
      site_id: siteId,
      start_date: startDate,
      end_date: endDate,
      metrics: "pv_count,visitor_count,ip_count,bounce_ratio,avg_visit_time",
      method: "source/all/a",
    },
  };

  try {
    const response = await axios.post(
      "https://api.baidu.com/json/tongji/v1/ReportService/getData",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const pageSum = response.data.body.data[0].result.pageSum[0];
    const timeSpan = response.data.body.data[0].result.timeSpan[0];
    const second =
      (pageSum[4] % 60).toString().length === 1
        ? "0" + (pageSum[4] % 60)
        : pageSum[4] % 60;
    const avgVisitTime = "00:" + Math.floor(pageSum[4] / 60) + ":" + second;
    return {
      date: timeSpan,
      pv: pageSum[0],
      uv: pageSum[1],
      ip: pageSum[2],
      bounceRate: pageSum[3] + "%",
      avgVisitTime: avgVisitTime,
    };
  } catch (error) {
    console.error("请求数据失败", error);
    return null;
  }
}
async function requestDataForYesterday(siteId, userName, accessToken) {
    const now = new Date();
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    const startDate = `${yesterday.getFullYear()}${(yesterday.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${yesterday.getDate().toString().padStart(2, "0")}`;
    const endDate = startDate;
    return requestData(siteId, startDate, endDate, userName, accessToken);
  }
  
module.exports = requestData;
