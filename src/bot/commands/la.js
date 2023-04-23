function laHandler(bot) {
    bot.onText(/51la统计/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, '这是51la统计相关信息。');
    });
  }
  
  module.exports = laHandler;
  