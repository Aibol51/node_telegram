const fs = require("fs");
const path = require("path");
const { createKeyboard } = require("../helpers/keyboard");
const requestData = require("../helpers/requestData");
const generateImageFromTable = require("../helpers/generateImage");

const userName = "df202303";
const accessToken =
  "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhY2MiLCJhdWQiOiLnmb7luqbnu5_orqEiLCJ1aWQiOjQ2Mzc1NTc1LCJhcHBJZCI6IjEzYmQ1MDQ5YTY3NmQxMDczNzk1OTkzMjEwMmVjNTU3IiwiaXNzIjoi5ZWG5Lia5byA5Y-R6ICF5Lit5b-DIiwicGxhdGZvcm1JZCI6IjQ5NjAzNDU5NjU5NTg1NjE3OTQiLCJleHAiOjE2ODQ2NzQ2ODcsImp0aSI6Ijc0OTU0NzA4MjIxMTQxNzMwMjEifQ.qtvoMvFYdiYHVjf5EhjiL2BaRPWLCvOgZtsQjQNFofyKcWvIGcpWaW4iSBLGHdBO";

function startHandler(bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "请选择您需要的统计服务：", {
      reply_markup: {
        inline_keyboard: createKeyboard(),
      },
    });
  });

  bot.on("callback_query", (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === "baidu") {
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      bot.sendMessage(chatId, "百度统计", {
        reply_markup: { inline_keyboard: createSiteButtons() },
      });
    } else if (data === "la") {
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      bot.sendMessage(chatId, "这是51la统计相关信息。");
    } else if (data.startsWith("site_")) {
      const siteId = data.slice(5);
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      handleSiteButtonClick(chatId, siteId, bot, userName, accessToken);
    }
  });
}

async function handleSiteButtonClick(
  chatId,
  siteId,
  bot,
  userName,
  accessToken
) {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 14);
  const result = [];
  for (let i = 0; i < 14; i++) {
    startDate.setDate(startDate.getDate() + 1);

    const dateStr = `${startDate.getFullYear()}${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${startDate.getDate().toString().padStart(2, "0")}`;
    const data = await requestData(
      siteId,
      dateStr,
      dateStr,
      userName,
      accessToken
    );
    if (data) {
      result.push(data);
    }
  }

  if (result.length === 0) {
    bot.sendMessage(chatId, "无法获取数据，请稍后重试。");
    return;
  }

  const prevWeek = result.slice(0, 7);
  const currWeek = result.slice(7, result.length);

  const finalResult = currWeek.map((item, index) => {
    // Calculate percentage change for each metric
    const comparePv = calculatePercentageChange(prevWeek[index].pv, item.pv);
    const compareUv = calculatePercentageChange(prevWeek[index].uv, item.uv);
    const compareIp = calculatePercentageChange(prevWeek[index].ip, item.ip);
    const compareBounceRate = calculatePercentageChange(
      prevWeek[index].bounceRate,
      item.bounceRate
    );
    const compareAvgVisitTime = calculatePercentageChange(
      prevWeek[index].avgVisitTime,
      item.avgVisitTime
    );

    // Calculate yesterday's comparison for each metric
    const comparePvYesterday = calculatePercentageChange(result[index].pv, item.pv);
    const compareUvYesterday = calculatePercentageChange(result[index].uv, item.uv);
    const compareIpYesterday = calculatePercentageChange(result[index].ip, item.ip);
    const compareBounceRateYesterday = calculatePercentageChange(
      result[index].bounceRate,
      item.bounceRate
    );
    const compareAvgVisitTimeYesterday = calculatePercentageChange(
      result[index].avgVisitTime,
      item.avgVisitTime
    );

    return {
      date: item.date,
      pv: item.pv,
      comparePv,
      comparePvYesterday,
      uv: item.uv,
      compareUv,
      compareUvYesterday,
      ip: item.ip,
      compareIp,
      compareIpYesterday,
      bounceRate: item.bounceRate,
      compareBounceRate,
      compareBounceRateYesterday,
      avgVisitTime: item.avgVisitTime,
      compareAvgVisitTime,
      compareAvgVisitTimeYesterday,
    };
  });
  const todayData = result[result.length - 1];
  const yesterdayData = await requestDataForYesterday(
    siteId,
    userName,
    accessToken
  );
  const todayVsYesterday = {
    comparePv: calculatePercentageChange(yesterdayData.pv, todayData.pv),
    compareUv: calculatePercentageChange(yesterdayData.uv, todayData.uv),
    compareIp: calculatePercentageChange(yesterdayData.ip, todayData.ip),
    compareBounceRate: calculatePercentageChange(
      yesterdayData.bounceRate,
      todayData.bounceRate
    ),
    compareAvgVisitTime: calculatePercentageChange(
      yesterdayData.avgVisitTime,
      todayData.avgVisitTime
    ),
  };
  const finalResultWithToday = [
    ...finalResult,
    {
      date: todayData.date,
      pv: todayData.pv,
      comparePv: todayVsYesterday.comparePv,
      uv: todayData.uv,
      compareUv: todayVsYesterday.compareUv,
      ip: todayData.ip,
      compareIp: todayVsYesterday.compareIp,
      bounceRate: todayData.bounceRate,
      compareBounceRate: todayVsYesterday.compareBounceRate,
      avgVisitTime: todayData.avgVisitTime,
      compareAvgVisitTime: todayVsYesterday.compareAvgVisitTime,
    },
  ];

  console.log(finalResultWithToday);

  try {
    const buffer = await generateImageFromTable(finalResultWithToday);
    bot.sendPhoto(chatId, buffer).catch((error) => {
      console.error("发送图片失败", error);
    });
  } catch (error) {
    console.error("生成图片失败", error);
  }
}
function calculatePercentageChange(oldValue, newValue) {
  let oldVal = oldValue;
  let newVal = newValue;

  // Convert bounceRate from string percentage to number
  if (typeof oldValue === "string" && oldValue.includes("%")) {
    oldVal = parseFloat(oldValue) / 100;
    newVal = parseFloat(newValue) / 100;
  }

  // Convert avgVisitTime from string time format to seconds
  if (typeof oldValue === "string" && oldValue.includes(":")) {
    const oldTimeParts = oldValue.split(":").map((part) => parseInt(part, 10));
    const newTimeParts = newValue.split(":").map((part) => parseInt(part, 10));
    oldVal = oldTimeParts[0] * 3600 + oldTimeParts[1] * 60 + oldTimeParts[2];
    newVal = newTimeParts[0] * 3600 + newTimeParts[1] * 60 + newTimeParts[2];
  }

  const diff = newVal - oldVal;
  const percentageChange = (diff / oldVal) * 100;

  return percentageChange.toFixed(2) + "%";
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

function createSiteButtons() {
  const siteMapping = require("../data/siteMapping");
  const buttons = [];

  for (const key in siteMapping) {
    buttons.push([{ text: siteMapping[key], callback_data: `site_${key}` }]);
  }

  return buttons;
}

module.exports = startHandler;
