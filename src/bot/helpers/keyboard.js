function createKeyboard() {
    return [
      [
        { text: '百度统计', callback_data: 'baidu' },
        { text: '51la统计', callback_data: 'la' },
      ],
    ];
  }
  
  module.exports = { createKeyboard };
  