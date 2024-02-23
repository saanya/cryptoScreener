const {telegram} = require('~/configs/telegram')
const {userSettings} = require(`~/configs/userSettings`)
const {UserModel} = require('~/components/model/UserModel')
const {UserExchangeModel} = require('~/components/model/UserExchangeModel')
const {UserSettingsModel} = require('~/components/model/UserSettingsModel')
const {UserMessageModel} = require('~/components/model/UserMessageModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {ExchangeStatusEnum} = require('~/enum/ExchangeStatusEnum')
const {ButtonEnum} = require('~/enum/ButtonEnum')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')

const telegramComponent = new TelegramComponent(
  telegram.botToken,
  telegram.chatId,
)
const userModel = new UserModel()
const userExchangeModel = new UserExchangeModel()
const userSettingsModel = new UserSettingsModel()
const userMessageModel = new UserMessageModel()

class BotHandlerComponent {
  telegrafBot = null

  constructor() {
    this.telegrafBot = telegramComponent.getTelegraf()
  }

  getBotButton(userExchange) {
    debugger
    const binanceData = userExchange.find(
      (item) => item.exchange === ExchangeEnum.binance,
    )
    const bybitData = userExchange.find(
      (item) => item.exchange === ExchangeEnum.bybit,
    )
    return {
      reply_markup: {
        keyboard: [
          /* Inline buttons. 2 side-by-side */
          [
            {
              text:
                binanceData?.status === ExchangeStatusEnum.enabled
                  ? '✅ Binance'
                  : '❌ Binance',
            },
            {
              text:
                bybitData?.status === ExchangeStatusEnum.enabled
                  ? '✅ Bybit'
                  : '❌ Bybit',
            },
          ],
          [
            {text: '⤴️ Period when OI grow up'},
            {text: '⤵️ Period when OI go down'},
          ],
          [{text: '⤴️ Percentage of OI ➕'}, {text: '⤵️ Percentage of OI ➖'}],
          [{text: 'My Settings'}],
        ],
        resize_keyboard: true,
      },
    }
  }

  startListeners() {
    this.telegrafBot.start(async (ctx) => {
      console.log(ctx)
      debugger

      await userModel.save(
        ctx.update.message.from.id,
        ctx.update.message.chat.id,
        ctx.update.message?.from?.username,
        ctx.update.message?.from?.first_name,
        UserStatusEnum.active,
        new Date(),
      )
      const userData = await userModel.getByTelegramId(
        ctx.update.message.from.id,
      )
      let userId = userData.id

      await userExchangeModel.save(
        userId,
        ExchangeEnum.binance,
        ExchangeStatusEnum.enabled,
      )
      await userExchangeModel.save(
        userId,
        ExchangeEnum.bybit,
        ExchangeStatusEnum.enabled,
      )
      const exchangeData = await userExchangeModel.getByUserId(userId)

      await userSettingsModel.save(
        userId,
        userSettings.periodPlus,
        userSettings.periodMinus,
        userSettings.percentagePlus,
        userSettings.percentageMinus,
      )
      await userMessageModel.deleteById(userId)

      return ctx.reply(
        'Welcome to the Crypro Screener bot, choose your settings below',
        this.getBotButton(exchangeData),
      )
    })

    this.telegrafBot.on('message', async (ctx) => {
      debugger
      const telegramUserId = ctx.update.message.from.id
      const userData = await userModel.getByTelegramId(telegramUserId)
      let previousMessage = await userMessageModel.getLastByUserId(userData.id)
      console.log(previousMessage)
      let message = ctx.update.message.text
      console.log(message)
      await userMessageModel.save(userData.id, message, new Date())

      if (message === 'My Settings') {
        const userSettingsData = await userSettingsModel.getByUserId(
          userData.id,
        )
        console.log(userSettingsData)
        message = `
Your settings:
⤴️ Period when OI grow up ${userSettingsData?.periodPlus} 
⤵️ Period when OI go down ${userSettingsData?.periodMinus} 
⤴️ Percentage of OI ➕ ${userSettingsData?.percentagePlus} 
⤵️ Percentage of OI ➖ ${userSettingsData?.percentageMinus}`
      }

      if (message === '⤴️ Period when OI grow up') {
        return ctx.reply('Please enter number between 1 and 30', {
          reply_markup: {
            keyboard: [[{text: 'Cancel'}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === '⤵️ Period when OI go down') {
        return ctx.reply('Please enter number between 1 and 30', {
          reply_markup: {
            keyboard: [[{text: 'Cancel'}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === '⤴️ Percentage of OI ➕') {
        return ctx.reply('Please enter number between 1 and 30', {
          reply_markup: {
            keyboard: [[{text: 'Cancel'}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === '⤵️ Percentage of OI ➖') {
        return ctx.reply('Please enter number between 1 and 30', {
          reply_markup: {
            keyboard: [[{text: 'Cancel'}]],
            resize_keyboard: true,
          },
        })
      }

      if (previousMessage?.message === '⤴️ Period when OI grow up') {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return ctx.reply('Wrong number, should be between 1 and 30', {
            reply_markup: {
              keyboard: [[{text: 'Cancel'}]],
              resize_keyboard: true,
            },
          })
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            periodPlus: message,
          })
        }
      }

      if (previousMessage?.message === '⤵️ Period when OI go down') {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return ctx.reply('Wrong number, should be between 1 and 30', {
            reply_markup: {
              keyboard: [[{text: 'Cancel'}]],
              resize_keyboard: true,
            },
          })
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            periodMinus: message,
          })
        }
      }

      if (previousMessage?.message === '⤴️ Percentage of OI ➕') {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return ctx.reply('Wrong number, should be between 1 and 30', {
            reply_markup: {
              keyboard: [[{text: 'Cancel'}]],
              resize_keyboard: true,
            },
          })
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            percentagePlus: message,
          })
        }
      }

      if (previousMessage?.message === '⤵️ Percentage of OI ➖') {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return ctx.reply('Wrong number, should be between 1 and 30', {
            reply_markup: {
              keyboard: [[{text: 'Cancel'}]],
              resize_keyboard: true,
            },
          })
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            percentageMinus: message,
          })
        }
      }

      if (message === '✅ Binance') {
        message = 'Binance turn off'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.binance,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === '❌ Binance') {
        message = 'Binance turn on'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.binance,
          ExchangeStatusEnum.enabled,
        )
      }

      if (message === '✅ Bybit') {
        message = 'Bybit turn off'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === '❌ Bybit') {
        message = 'Bybit turn on'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.enabled,
        )
      }
      const exchangeData = await userExchangeModel.getByUserId(userData.id)
      return ctx.reply(message, this.getBotButton(exchangeData))

      //   return ctx.reply('11', {
      //     reply_markup: {
      //       keyboard: [
      //         /* Inline buttons. 2 side-by-side */
      //         [
      //           {text: '✅ Binance', callback_data: ButtonEnum.btn1},
      //           {text: '✅ Bybit', callback_data: ButtonEnum.btn2},
      //         ],
      //       ],
      //       resize_keyboard: true,
      //     },
      //   })
    })

    this.telegrafBot.on('callback_query', (ctx) => {
      console.log(ctx, 'callback_query')
      debugger
      const action = ctx.update.callback_query.data
      //   return ctx.reply(
      //     'Welcome to the Crypro Screener bot, choose your settings below',
      //     {
      //       reply_markup: {
      //         inline_keyboard: [
      //           /* Inline buttons. 2 side-by-side */
      //           [
      //             {text: '✅ Binance', callback_data: ButtonEnum.btn1},
      //             {text: '✅ Bybit', callback_data: ButtonEnum.btn2},
      //           ],
      //           [
      //             {
      //               text: '⤴️ Period when OI grow up',
      //               callback_data: ButtonEnum.btn3,
      //             },
      //             {
      //               text: '⤵️ Period when OI go down',
      //               callback_data: ButtonEnum.btn4,
      //             },
      //           ],
      //           [
      //             {
      //               text: '⤴️ Percentage of OI ➕',
      //               callback_data: ButtonEnum.btn5,
      //             },
      //             {
      //               text: '⤵️ Percentage of OI ➖',
      //               callback_data: ButtonEnum.btn6,
      //             },
      //           ],
      //         ],
      //       },
      //     },
      //   )

      //   for (let button of botButton.reply_markup.keyboard) {
      //     console.log(button)
      //   }

      switch (action) {
        case ButtonEnum.btn1:
          console.log(action)
          break
      }
    })

    this.telegrafBot.launch().then(() => console.log('Bot Started!'))
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  }
}
exports.BotHandlerComponent = BotHandlerComponent
