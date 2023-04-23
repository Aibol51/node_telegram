const TelegramBot = require('node-telegram-bot-api');
const { telegramToken } = require('../../config/config');

const startHandler = require('./commands/start');
const baiduHandler = require('./commands/baidu');
const laHandler = require('./commands/la');

const bot = new TelegramBot(telegramToken, { polling: true });

startHandler(bot);
baiduHandler(bot);
laHandler(bot);
