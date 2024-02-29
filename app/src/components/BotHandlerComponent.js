const {telegram} = require('~/configs/telegram')
const {userSettings} = require(`~/configs/userSettings`)
const {UserModel} = require('~/components/model/UserModel')
const {UserExchangeModel} = require('~/components/model/UserExchangeModel')
const {UserSettingsModel} = require('~/components/model/UserSettingsModel')
const {UserMessageModel} = require('~/components/model/UserMessageModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {ExchangeStatusEnum} = require('~/enum/ExchangeStatusEnum')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')

const telegramComponent = new TelegramComponent(telegram.botToken)
const userModel = new UserModel()
const userExchangeModel = new UserExchangeModel()
const userSettingsModel = new UserSettingsModel()
const userMessageModel = new UserMessageModel()

class BotHandlerComponent {
  telegrafBot = null
  static binanceTurnOn = '✅ Binance'
  static binanceTurnOff = '❌ Binance'
  static bybitTurnOn = '✅ Bybit'
  static bybitTurnOff = '❌ Bybit'
  static periodPlus = '⤴️ Period when OI grow up'
  static periodSilence = '〰️ Silence period'
  static percentagePlus = '⤴️ Percentage of OI ➕'
  static percentageAfterSilence = 'Percentage of jumping after silence ➕'
  static skipSignalPeriod = '‼️ Skip signal period'
  static settings = 'My Settings'
  static hintValue = 'Please enter number between 1 and 30'
  static hintSilenceValue = 'Please enter number between 5 and 720'
  static wrongValue = 'Wrong number, should be between 1 and 30'
  static wrongSilenceValue = 'Please enter number between 5 and 720'
  static cancel = 'Cancel'

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
                  ? BotHandlerComponent.binanceTurnOn
                  : BotHandlerComponent.binanceTurnOff,
            },
            {
              text:
                bybitData?.status === ExchangeStatusEnum.enabled
                  ? BotHandlerComponent.bybitTurnOn
                  : BotHandlerComponent.bybitTurnOff,
            },
          ],
          [
            {text: BotHandlerComponent.periodPlus},
            {text: BotHandlerComponent.periodSilence},
          ],
          [
            {text: BotHandlerComponent.percentagePlus},
            {text: BotHandlerComponent.percentageAfterSilence},
          ],

          [
            {text: BotHandlerComponent.skipSignalPeriod},
            {text: BotHandlerComponent.settings},
          ],
        ],
        resize_keyboard: true,
      },
    }
  }

  async getUserButtonWithMessage(ctx, message, userId) {
    const exchangeData = await userExchangeModel.getByUserId(userId)
    return ctx.reply(message, this.getBotButton(exchangeData))
  }

  startListeners() {
    this.telegrafBot.start(async (ctx) => {
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
        userSettings.periodSilence,
        userSettings.percentagePlus,
        userSettings.percentageAfterSilence,
        userSettings.skipSignalPeriod,
      )
      await userMessageModel.deleteById(userId)

      return ctx.reply(
        'Welcome to the Crypro Screener Silence bot, choose your settings below',
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

      if (message === BotHandlerComponent.settings) {
        const userSettingsData = await userSettingsModel.getByUserId(
          userData.id,
        )
        message = `
Your settings:
${BotHandlerComponent.periodPlus} ${userSettingsData?.periodPlus} 
${BotHandlerComponent.periodSilence} ${userSettingsData?.periodSilence} 
${BotHandlerComponent.percentagePlus} ${userSettingsData?.percentagePlus} 
${BotHandlerComponent.percentageAfterSilence} ${userSettingsData?.percentageAfterSilence}`
      }

      if (message === BotHandlerComponent.cancel) {
        return this.getUserButtonWithMessage(ctx, message, userData.id)
      }

      if (message === BotHandlerComponent.periodPlus) {
        return ctx.reply(BotHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotHandlerComponent.periodSilence) {
        return ctx.reply(BotHandlerComponent.hintSilenceValue, {
          reply_markup: {
            keyboard: [[{text: BotHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotHandlerComponent.percentagePlus) {
        return ctx.reply(BotHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotHandlerComponent.percentageAfterSilence) {
        return ctx.reply(BotHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotHandlerComponent.skipSignalPeriod) {
        return ctx.reply(BotHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (previousMessage?.message === BotHandlerComponent.periodPlus) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            periodPlus: message,
          })
        }
      }

      if (previousMessage?.message === BotHandlerComponent.periodSilence) {
        if (parseInt(message) < 5 || parseInt(message) > 720) {
          return this.getUserButtonWithMessage(
            ctx,
            BotHandlerComponent.wrongSilenceValue,
            userData.id,
          )
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            periodSilence: message,
          })
        }
      }

      if (previousMessage?.message === BotHandlerComponent.percentagePlus) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            percentagePlus: message,
          })
        }
      }

      if (
        previousMessage?.message === BotHandlerComponent.percentageAfterSilence
      ) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            percentageAfterSilence: message,
          })
        }
      }

      if (previousMessage?.message === BotHandlerComponent.skipSignalPeriod) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userSettingsModel.updateByUserId(userData.id, {
            skipSignalPeriod: message,
          })
        }
      }

      if (message === BotHandlerComponent.binanceTurnOn) {
        message = 'Binance turn off'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.binance,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === BotHandlerComponent.binanceTurnOff) {
        message = 'Binance turn on'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.binance,
          ExchangeStatusEnum.enabled,
        )
      }

      if (message === BotHandlerComponent.bybitTurnOn) {
        message = 'Bybit turn off'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === BotHandlerComponent.bybitTurnOff) {
        message = 'Bybit turn on'
        await userExchangeModel.save(
          userData.id,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.enabled,
        )
      }
      const exchangeData = await userExchangeModel.getByUserId(userData.id)
      return ctx.reply(message, this.getBotButton(exchangeData))
    })

    this.telegrafBot.launch().then(() => console.log('Bot Started!'))
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  }
}
exports.BotHandlerComponent = BotHandlerComponent
