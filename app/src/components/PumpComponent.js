const {UserModel} = require('~/components/model/UserModel')
const {
  UserPumpSettingsModel,
} = require('~/components/model/UserPumpSettingsModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {telegram} = require('~/configs/telegram')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {PairPriceModel} = require('~/components/model/PairPriceModel')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')
const {ExchangeStatusEnum} = require('~/enum/ExchangeStatusEnum')
const {UserSignalPumpModel} = require('~/components/model/UserSignalPumpModel')
const {UserExchangeModel} = require('~/components/model/UserExchangeModel')
const {UserBotTypeEnum} = require('~/enum/UserBotTypeEnum')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const date = require('date-and-time')

class PumpComponent {
  #telegram = null
  #userModel = null
  #userPumpSettingsModel = null
  #currencyPairModel = null
  #pairPriceModel = null
  #userSignalPumpModel = null
  #userExchangeModel = null
  static DATE_FORMAT = 'YYYY-MM-DD'

  constructor() {
    this.#telegram = new TelegramComponent(telegram.botPumpToken)
    this.#userModel = new UserModel()
    this.#userPumpSettingsModel = new UserPumpSettingsModel()
    this.#currencyPairModel = new CurrencyPairModel()
    this.#pairPriceModel = new PairPriceModel()
    this.#userSignalPumpModel = new UserSignalPumpModel()
    this.#userExchangeModel = new UserExchangeModel()
  }

  getCoinbaseBinanceUrl(echange, currencyPair) {
    return `<a href='https://www.coinglass.com/tv/en/${echange}_${currencyPair}'>${currencyPair}</a>`
  }

  getMessage(
    echange,
    currencyPair,
    percentagePlus,
    lastPrice,
    lowerPrice,
    signalNumber,
  ) {
    let echangeSymbol = ''
    if (echange === ExchangeEnum.binance) {
      echangeSymbol = '🟡'
    } else if (echange === ExchangeEnum.bybit) {
      echangeSymbol = '⚫'
    }
    return `${echangeSymbol} ${echange}: ${this.getCoinbaseBinanceUrl(
      echange,
      currencyPair,
    )}
💸 Price +${percentagePlus}% (${parseFloat(lastPrice)} - ${parseFloat(
      lowerPrice,
    )} $)
Signal 24h: ${signalNumber}`
  }

  async processPump(exchange) {
    debugger
    let currencyPairs = await this.#currencyPairModel.getByExchange(exchange)

    let usersData = await this.#userModel.getAll(UserStatusEnum.active)
    if (usersData.length === 0) {
      return
    }
    let userIds = usersData.map((item) => item.id)
    let userSettingsData = await this.#userPumpSettingsModel.getByUserIds(
      userIds,
    )
    let userExchangesData = await this.#userExchangeModel.getByUserIds(
      userIds,
      UserBotTypeEnum.openInterest,
      exchange,
    )

    for (let userData of usersData) {
      let userSettings = userSettingsData.find(
        (item) => item.userId === userData.id,
      )
      console.log(userSettings)
      if (!userSettings) {
        continue
      }

      let exchangeSettings = userExchangesData.find(
        (item) => item.userId === userData.id,
      )
      if (
        !exchangeSettings ||
        exchangeSettings?.status === ExchangeStatusEnum.disabled
      ) {
        continue
      }

      let currentDate = new Date()
      const dateFrom = currentDate.setMinutes(
        currentDate.getMinutes() - userSettings.periodPlus,
      )
      let pairPricesData = await this.#pairPriceModel.getByPeriod(
        new Date(dateFrom),
        exchange,
      )

      for (let currencyPair of currencyPairs) {
        let lastSignalData =
          await this.#userSignalPumpModel.getLastByUserIdPairId(
            userData.id,
            currencyPair.id,
            exchange,
          )
        let currentDate = new Date()
        const skipSignalPeriod = currentDate.setMinutes(
          currentDate.getMinutes() - userSettings.skipSignalPeriod,
        )

        if (
          lastSignalData &&
          new Date(lastSignalData.createdAt) > new Date(skipSignalPeriod)
        ) {
          continue
        }

        let countSignal = await this.#userSignalPumpModel.getCountByDate(
          userData.id,
          currencyPair.id,
          exchange,
          date.format(new Date(), PumpComponent.DATE_FORMAT),
        )
        if (countSignal > userSettings.skipSignalCount) {
          continue
        }
        let priceData = pairPricesData.filter(
          (item) => item.pairId === currencyPair.id,
        )
        if (priceData.length > 2) {
          let lastPrice = parseFloat(priceData.pop().price).toFixed(6)
          let lowePriceData = priceData.sort(
            (prev, curr) => parseFloat(prev.price) - parseFloat(curr.price),
          )

          let lowerPrice = parseFloat(lowePriceData.pop().price).toFixed(6)
          // let beforeLastPrice = parseFloat(priceData.pop().price).toFixed(6)
          if (lastPrice > lowerPrice) {
            let percentagePlus = parseFloat(
              100 - parseFloat(lowerPrice / lastPrice).toFixed(6) * 100,
            ).toFixed(2)
            // console.log(
            //   currencyPair.pair,
            //   lastPrice,
            //   lowerPrice,
            //   percentagePlus,
            //   userSettings.percentagePlus,
            // )
            if (percentagePlus > userSettings.percentagePlus) {
              console.log(
                `PRICE UP`,
                percentagePlus,
                userSettings.percentagePlus,
              )
              await this.#userSignalPumpModel.save(
                userData.id,
                currencyPair.id,
                exchange,
                percentagePlus,
              )
              await this.#telegram.sendMessage(
                this.getMessage(
                  exchange,
                  currencyPair.pair,
                  percentagePlus,
                  lastPrice,
                  lowerPrice,
                  countSignal,
                ),
                userData.chatId,
              )
            }
          }
        }
      }
    }
  }
}

exports.PumpComponent = PumpComponent
