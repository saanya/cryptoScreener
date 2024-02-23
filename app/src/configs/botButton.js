const {ButtonEnum} = require('~/enum/ButtonEnum')

const botButton = {
  reply_markup: {
    keyboard: [
      /* Inline buttons. 2 side-by-side */
      [
        {text: '✅ Binance', callback_data: ButtonEnum.btn1},
        {text: '❌ Bybit', callback_data: ButtonEnum.btn2},
      ],
      [
        {text: '⤴️ Period when OI grow up', callback_data: ButtonEnum.btn3},
        {text: '⤵️ Period when OI go down', callback_data: ButtonEnum.btn4},
      ],
      [
        {text: '⤴️ Percentage of OI ➕', callback_data: ButtonEnum.btn5},
        {text: '⤵️ Percentage of OI ➖', callback_data: ButtonEnum.btn6},
      ],
    ],
    resize_keyboard: true,
  },
}

exports.botButton = botButton
