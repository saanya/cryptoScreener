require('module-alias/register')
require('dotenv').config()
const {BotHandlerComponent} = require('~/components/BotHandlerComponent')
const {
  BotPumpHandlerComponent,
} = require('~/components/BotPumpHandlerComponent')

const botHandlerComponent = new BotHandlerComponent()
const botPumpHandlerComponent = new BotPumpHandlerComponent()
botHandlerComponent.startListeners()
botPumpHandlerComponent.startListeners()

// const http = require('node:http')
//const {BinanceComponent} = require('~/components/BinanceComponent')
// const {TelegramComponent} = require('~/components/TelegramComponent')
// const {telegram} = require('~/configs/telegram')
// // const PORT = 8000
// const telegramComponent = new TelegramComponent(
//   telegram.botToken,
//   telegram.chatId,
// )
// //const binanceComponent = new BinanceComponent(telegramComponent)

// const bot = telegramComponent.getTelegraf()
// bot.start((ctx) => {
//   console.log(ctx)
//   return ctx.reply(
//     'Welcome to the Crypro Screener bot, choose your settings below',
//     {
//       reply_markup: {
//         inline_keyboard: [
//           /* Inline buttons. 2 side-by-side */
//           [
//             {text: 'Binance', callback_data: 'btn-1'},
//             {text: 'Bybit', callback_data: 'btn-2'},
//           ],
//           [
//             {text: 'Period when OI grow up', callback_data: 'btn-3'},
//             {text: 'Period when OI go down', callback_data: 'btn-4'},
//           ],
//           [
//             {text: 'Percentage of OI +', callback_data: 'btn-5'},
//             {text: 'Percentage of OI -', callback_data: 'btn-6'},
//           ],
//         ],
//       },
//     },
//   )
// })

// bot.on('message', (ctx) => {
//   console.log(ctx)
//   debugger
// })

// bot.on('callback_query', (ctx) => {
//   console.log(ctx, 'callback_query')
//   debugger
//   const action = ctx.update.callback_query.data

//   switch (action) {
//     case 'Hello world':
//       console.log('works!')
//       break
//   }
// })

// bot.launch().then(() => console.log('Bot Started!'))
// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

// http
//   .createServer(async (req, res) => {})
//   .listen(PORT, async (err, res) => {
//     console.log(`🚀 Server ready at port ${PORT} at ${new Date()}`)
//await binanceComponent.getOpenInterests()

// let symbols = await binanceComponent.getAllUsdtSymbols()
// for (let symbol of symbols) {
//   let openInterests = await binanceComponent.getOpenInterestsHistory(symbol)
//   if (openInterests.length > 0) {
//     let firstOpenInterests = parseInt(openInterests.shift().sumOpenInterest)
//     let lastOpenInterests = parseInt(openInterests.pop().sumOpenInterest)
//     let percentagePlus = 0,
//       percentageMinus = 0
//     if (lastOpenInterests > firstOpenInterests) {
//       percentagePlus = parseFloat(
//         100 -
//           parseFloat(firstOpenInterests / lastOpenInterests).toFixed(4) *
//             100,
//       ).toFixed(2)
//     } else {
//       percentageMinus = parseFloat(
//         100 -
//           parseFloat(lastOpenInterests / firstOpenInterests).toFixed(4) *
//             100,
//       ).toFixed(2)
//     }

//     if (percentagePlus > 2) {
//       telegramComponent.sendMessage(
//         `OI: Binance: ${symbol}, + ${percentagePlus} , https://www.coinglass.com/tv/ru/Binance_${symbol}`,
//       )
//       console.log(`OI: Binance: ${symbol}, + ${percentagePlus}`)
//     }
//     if (percentageMinus > 2) {
//       console.log(`Symbol: ${symbol}, - ${percentageMinus}`)
//     }
//   }
// }
// })
