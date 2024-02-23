const {UserModel} = require('~/components/model/UserModel')
const {UserSettingsModel} = require('~/components/model/UserSettingsModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {telegram} = require('~/configs/telegram')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {OpenInterestModel} = require('~/components/model/OpenInterestModel')
const {PairPriceModel} = require('~/components/model/PairPriceModel')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')
const {ExchangeStatusEnum} = require('~/enum/ExchangeStatusEnum')
const {UserSignalModel} = require('~/components/model/UserSignalModel')
const {UserExchangeModel} = require('~/components/model/UserExchangeModel')
const date = require('date-and-time')

class OpenInterestComponent {
  #telegram = null
  #userModel = null
  #userSettingsModel = null
  #currencyPairModel = null
  #openInterestModel = null
  #pairPriceModel = null
  #userSignalModel = null
  #userExchangeModel = null
  static DATE_FORMAT = 'YYYY-MM-DD'

  constructor() {
    this.#telegram = new TelegramComponent(telegram.botToken)
    this.#userModel = new UserModel()
    this.#userSettingsModel = new UserSettingsModel()
    this.#currencyPairModel = new CurrencyPairModel()
    this.#openInterestModel = new OpenInterestModel()
    this.#pairPriceModel = new PairPriceModel()
    this.#userSignalModel = new UserSignalModel()
    this.#userExchangeModel = new UserExchangeModel()
  }

  getCoinbaseBinanceUrl(echange, currencyPair) {
    return `<a href='https://www.coinglass.com/tv/en/${echange}_${currencyPair}'>${currencyPair}</a>`
  }

  getMessage(echange, currencyPair, percentagePlus, price, signalNumber) {
    return `${echange}: ${this.getCoinbaseBinanceUrl(echange, currencyPair)}
OI +${percentagePlus}% 
${price > 0 ? 'Price +' + price : 'Price -' + price}% 
Signal number: ${signalNumber}`
  }

  async getOpenInterests(exchange) {
    debugger
    let currencyPairs = await this.#currencyPairModel.getByExchange(exchange)

    let usersData = await this.#userModel.getAll(UserStatusEnum.active)
    if (usersData.length === 0) {
      return
    }
    console.log(usersData)
    let userIds = usersData.map((item) => item.id)
    let userSettingsData = await this.#userSettingsModel.getByUserIds(userIds)
    let userExchangesData = await this.#userExchangeModel.getByUserIds(
      userIds,
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
      console.log(exchangeSettings)
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
      let openInterestsData = await this.#openInterestModel.getByPeriod(
        new Date(dateFrom),
      )
      let pairPricesData = await this.#pairPriceModel.getByPeriod(
        new Date(dateFrom),
      )
      for (let currencyPair of currencyPairs) {
        let openInterestsByPairId = openInterestsData.filter(
          (item) => item.pairId === currencyPair.id,
        )

        if (openInterestsByPairId.length > 0) {
          // let firstOpenInterests = parseInt(openInterestsByPairId.shift().value)
          let lastOpenInterest = parseInt(openInterestsByPairId.pop().value)
          let lowerOpenInterestData = openInterestsByPairId.reduce(
            (prev, curr) => (prev.value < curr.value ? prev : curr),
          )
          let lowerOpenInterestValue = parseInt(lowerOpenInterestData.value)

          let percentagePlus = 0,
            percentageMinus = 0
          if (lastOpenInterest > lowerOpenInterestValue) {
            percentagePlus = parseFloat(
              100 -
                parseFloat(lowerOpenInterestValue / lastOpenInterest).toFixed(
                  4,
                ) *
                  100,
            ).toFixed(2)
          } else {
            percentageMinus = parseFloat(
              100 -
                parseFloat(lastOpenInterest / lowerOpenInterestValue).toFixed(
                  4,
                ) *
                  100,
            ).toFixed(2)
          }

          if (parseInt(percentagePlus) >= userSettings.percentagePlus) {
            let lastSignalData =
              await this.#userSignalModel.getLastByUserIdPairId(
                userData.id,
                currencyPair.id,
                exchange,
              )
            if (
              lastSignalData &&
              new Date(lastSignalData.createdAt) > new Date(dateFrom)
            ) {
              continue
            }

            let countSignal = await this.#userSignalModel.getCountByDate(
              userData.id,
              currencyPair.id,
              exchange,
              date.format(new Date(), OpenInterestComponent.DATE_FORMAT),
            )
            let priceData = pairPricesData.filter(
              (item) => item.pairId === currencyPair.id,
            )
            if (priceData.length > 0) {
              let lastPrice = parseFloat(priceData.pop().price).toFixed(6)
              let lowePriceData = priceData.reduce((prev, curr) =>
                prev.value < curr.value ? prev : curr,
              )
              let lowerPrice = parseFloat(lowePriceData.price).toFixed(6)

              let pricePlus = 0,
                priceMinus = 0
              if (lastPrice > lowerPrice) {
                pricePlus = parseFloat(
                  100 - parseFloat(lowerPrice / lastPrice).toFixed(6) * 100,
                ).toFixed(2)
              } else {
                priceMinus = parseFloat(
                  100 - parseFloat(lastPrice / lowerPrice).toFixed(6) * 100,
                ).toFixed(2)
              }

              if (pricePlus) {
                await this.#userSignalModel.save(
                  userData.id,
                  currencyPair.id,
                  exchange,
                  percentagePlus,
                  percentageMinus,
                  pricePlus,
                  priceMinus,
                )
                await this.#telegram.sendMessage(
                  this.getMessage(
                    exchange,
                    currencyPair.pair,
                    percentagePlus,
                    pricePlus,
                    countSignal,
                  ),
                  userData.chatId,
                )
              } else {
                await this.#userSignalModel.save(
                  userData.id,
                  currencyPair.id,
                  exchange,
                  percentagePlus,
                  percentageMinus,
                  pricePlus,
                  priceMinus,
                )
                await this.#telegram.sendMessage(
                  this.getMessage(
                    exchange,
                    currencyPair.pair,
                    percentagePlus,
                    priceMinus,
                    countSignal,
                  ),
                  userData.chatId,
                )
              }
            } else {
              await this.#userSignalModel.save(
                userData.id,
                currencyPair.id,
                exchange,
                percentagePlus,
                percentageMinus,
                0,
                0,
              )
              await this.#telegram.sendMessage(
                this.getMessage(
                  exchange,
                  currencyPair.pair,
                  percentagePlus,
                  0,
                  countSignal,
                ),
                userData.chatId,
              )
            }

            console.log(
              `OI: ${exchange}: ${currencyPair.pair} +${percentagePlus}`,
            )
          }
        }
      }
    }
  }
}

exports.OpenInterestComponent = OpenInterestComponent
