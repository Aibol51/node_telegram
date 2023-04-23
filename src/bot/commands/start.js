const { createKeyboard } = require('../helpers/keyboard');

function startHandler(bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '请选择您需要的统计服务：', {
      reply_markup: {
        inline_keyboard: createKeyboard(),
      },
    });
  });

  // 处理回调查询事件
  bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'baidu') {
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      bot.sendMessage(chatId, '百度统计', { reply_markup: { inline_keyboard: createSiteButtons() } });
    } else if (data === 'la') {
      bot.answerCallbackQuery(callbackQuery.id); // 响应回调查询
      bot.sendMessage(chatId, '这是51la统计相关信息。');
    }
  });
}

function createSiteButtons() {
  const siteMapping = require('../data/siteMapping');
  const buttons = [];

  for (const key in siteMapping) {
    buttons.push([{ text: siteMapping[key], callback_data: `site_${key}` }]);
  }

  return buttons;
}

module.exports = startHandler;
