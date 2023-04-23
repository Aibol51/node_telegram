const siteMapping = require('../data/siteMapping');

function createSiteButtons() {
  const buttons = [];

  for (const key in siteMapping) {
    buttons.push([{ text: siteMapping[key], callback_data: `site_${key}` }]);
  }

  return buttons;
}

function baiduHandler(bot) {
  bot.onText(/百度统计/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '请选择站点：', {
      reply_markup: {
        inline_keyboard: createSiteButtons(),
      },
    });
  });

  // 处理回调查询事件
  bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith('site_')) {
      const siteId = data.slice(5);
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      bot.sendMessage(chatId, `您选择了站点：${siteMapping[siteId]}`);
    }
  });
}

module.exports = baiduHandler;
