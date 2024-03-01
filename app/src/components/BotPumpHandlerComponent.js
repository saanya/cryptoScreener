const {telegram} = require('~/configs/telegram')
const {userPumpSettings} = require(`~/configs/userPumpSettings`)
const {UserModel} = require('~/components/model/UserModel')
const {UserExchangeModel} = require('~/components/model/UserExchangeModel')
const {
  UserPumpSettingsModel,
} = require('~/components/model/UserPumpSettingsModel')
const {UserMessageModel} = require('~/components/model/UserMessageModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {ExchangeStatusEnum} = require('~/enum/ExchangeStatusEnum')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')
const {UserBotTypeEnum} = require('~/enum/UserBotTypeEnum')

const telegramComponent = new TelegramComponent(telegram.botPumpToken)
const userModel = new UserModel()
const userExchangeModel = new UserExchangeModel()
const userPumpSettingsModel = new UserPumpSettingsModel()
const userMessageModel = new UserMessageModel()

class BotPumpHandlerComponent {
  telegrafBot = null
  static binanceTurnOn = '✅ Binance'
  static binanceTurnOff = '❌ Binance'
  static bybitTurnOn = '✅ Bybit'
  static bybitTurnOff = '❌ Bybit'
  static periodPlus = '⤴️ Period when price grow up'
  static percentagePlus = '⤴️ Percentage of price ➕'
  static skipSignalPeriod = '‼️ Skip signal period'
  static skipSignalCount = '‼️ Skip signal count'
  static settings = 'My Settings'
  static hintValue = 'Please enter number between 1 and 30'
  static wrongValue = 'Wrong number, should be between 1 and 30'
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
                  ? BotPumpHandlerComponent.binanceTurnOn
                  : BotPumpHandlerComponent.binanceTurnOff,
            },
            {
              text:
                bybitData?.status === ExchangeStatusEnum.enabled
                  ? BotPumpHandlerComponent.bybitTurnOn
                  : BotPumpHandlerComponent.bybitTurnOff,
            },
          ],
          [
            {text: BotPumpHandlerComponent.periodPlus},
            {text: BotPumpHandlerComponent.percentagePlus},
          ],
          [
            {text: BotPumpHandlerComponent.skipSignalPeriod},
            {text: BotPumpHandlerComponent.skipSignalCount},
          ],

          [{text: BotPumpHandlerComponent.settings}],
        ],
        resize_keyboard: true,
      },
    }
  }

  async getUserButtonWithMessage(ctx, message, userId) {
    const exchangeData = await userExchangeModel.getByUserId(
      userId,
      UserBotTypeEnum.pump,
    )
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
        UserBotTypeEnum.pump,
        ExchangeEnum.binance,
        ExchangeStatusEnum.enabled,
      )
      await userExchangeModel.save(
        userId,
        UserBotTypeEnum.pump,
        ExchangeEnum.bybit,
        ExchangeStatusEnum.enabled,
      )
      const exchangeData = await userExchangeModel.getByUserId(
        userId,
        UserBotTypeEnum.pump,
      )

      await userPumpSettingsModel.save(
        userId,
        userPumpSettings.periodPlus,
        userPumpSettings.percentagePlus,
        userPumpSettings.skipSignalPeriod,
        userPumpSettings.skipSignalCount,
      )
      await userMessageModel.deleteById(userId, UserBotTypeEnum.pump)

      return ctx.reply(
        'Welcome to the Crypro Screener Pump bot, choose your settings below',
        this.getBotButton(exchangeData),
      )
    })

    this.telegrafBot.on('message', async (ctx) => {
      debugger
      const telegramUserId = ctx.update.message.from.id
      const userData = await userModel.getByTelegramId(telegramUserId)
      let previousMessage = await userMessageModel.getLastByUserId(
        userData.id,
        UserBotTypeEnum.pump,
      )
      console.log(previousMessage)
      let message = ctx.update.message.text
      console.log(message)
      await userMessageModel.save(
        userData.id,
        UserBotTypeEnum.pump,
        message,
        new Date(),
      )

      if (message === BotPumpHandlerComponent.settings) {
        const userSettingsData = await userPumpSettingsModel.getByUserId(
          userData.id,
        )
        message = `
Your settings:
${BotPumpHandlerComponent.periodPlus} ${userSettingsData?.periodPlus} 
${BotPumpHandlerComponent.percentagePlus} ${userSettingsData?.percentagePlus} 
${BotPumpHandlerComponent.skipSignalPeriod} ${userSettingsData?.skipSignalPeriod}
${BotPumpHandlerComponent.skipSignalCount} ${userSettingsData?.skipSignalCount}`
      }

      if (message === BotPumpHandlerComponent.cancel) {
        return this.getUserButtonWithMessage(ctx, message, userData.id)
      }

      if (message === BotPumpHandlerComponent.periodPlus) {
        return ctx.reply(BotPumpHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotPumpHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotPumpHandlerComponent.percentagePlus) {
        return ctx.reply(BotPumpHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotPumpHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotPumpHandlerComponent.skipSignalPeriod) {
        return ctx.reply(BotPumpHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotPumpHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (message === BotPumpHandlerComponent.skipSignalCount) {
        return ctx.reply(BotPumpHandlerComponent.hintValue, {
          reply_markup: {
            keyboard: [[{text: BotPumpHandlerComponent.cancel}]],
            resize_keyboard: true,
          },
        })
      }

      if (previousMessage?.message === BotPumpHandlerComponent.periodPlus) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotPumpHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userPumpSettingsModel.updateByUserId(userData.id, {
            periodPlus: message,
          })
        }
      }

      if (previousMessage?.message === BotPumpHandlerComponent.percentagePlus) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotPumpHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userPumpSettingsModel.updateByUserId(userData.id, {
            percentagePlus: message,
          })
        }
      }

      if (
        previousMessage?.message === BotPumpHandlerComponent.skipSignalPeriod
      ) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotPumpHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userPumpSettingsModel.updateByUserId(userData.id, {
            skipSignalPeriod: message,
          })
        }
      }

      if (
        previousMessage?.message === BotPumpHandlerComponent.skipSignalCount
      ) {
        if (parseInt(message) < 1 || parseInt(message) > 30) {
          return this.getUserButtonWithMessage(
            ctx,
            BotPumpHandlerComponent.wrongValue,
            userData.id,
          )
        } else {
          await userPumpSettingsModel.updateByUserId(userData.id, {
            skipSignalCount: message,
          })
        }
      }

      if (message === BotPumpHandlerComponent.binanceTurnOn) {
        message = 'Binance turn off'
        await userExchangeModel.save(
          userData.id,
          UserBotTypeEnum.pump,
          ExchangeEnum.binance,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === BotPumpHandlerComponent.binanceTurnOff) {
        message = 'Binance turn on'
        await userExchangeModel.save(
          userData.id,
          UserBotTypeEnum.pump,
          ExchangeEnum.binance,
          ExchangeStatusEnum.enabled,
        )
      }

      if (message === BotPumpHandlerComponent.bybitTurnOn) {
        message = 'Bybit turn off'
        await userExchangeModel.save(
          userData.id,
          UserBotTypeEnum.pump,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.disabled,
        )
      } else if (message === BotPumpHandlerComponent.bybitTurnOff) {
        message = 'Bybit turn on'
        await userExchangeModel.save(
          userData.id,
          UserBotTypeEnum.pump,
          ExchangeEnum.bybit,
          ExchangeStatusEnum.enabled,
        )
      }
      const exchangeData = await userExchangeModel.getByUserId(
        userData.id,
        UserBotTypeEnum.pump,
      )
      return ctx.reply(message, this.getBotButton(exchangeData))
    })

    this.telegrafBot.launch().then(() => console.log('Bot Started!'))
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  }
}
exports.BotPumpHandlerComponent = BotPumpHandlerComponent
