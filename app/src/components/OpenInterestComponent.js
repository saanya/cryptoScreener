const {UserModel} = require('~/components/model/UserModel')
const {UserSettingsModel} = require('~/components/model/UserSettingsModel')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {telegram} = require('~/configs/telegram')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
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
  static OPEN_INTEREST_HOUR = 3

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
    //console.log(usersData)
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
      //console.log(userSettings)
      if (!userSettings) {
        continue
      }

      let exchangeSettings = userExchangesData.find(
        (item) => item.userId === userData.id,
      )
      //console.log(exchangeSettings)
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
        exchange,
      )
      let pairPricesData = await this.#pairPriceModel.getByPeriod(
        new Date(dateFrom),
        exchange,
      )
      currentDate = new Date()
      const dateFromHistory = currentDate.setMinutes(
        currentDate.getMinutes() - userSettings.periodSilence,
      )
      currentDate = new Date()
      const dateToHistory = currentDate.setMinutes(currentDate.getMinutes() - 1)
      //console.log(new Date(dateFromHistory), new Date(dateToHistory))

      let avarageOpenInterestsData =
        await this.#openInterestModel.getAvarageByPeriod(
          new Date(dateFromHistory),
          new Date(dateToHistory),
          exchange,
        )
      let minOpenInterestsData = await this.#openInterestModel.getMinByPeriod(
        new Date(dateFromHistory),
        new Date(dateToHistory),
        exchange,
      )

      let maxOpenInterestsData = await this.#openInterestModel.getMaxByPeriod(
        new Date(dateFromHistory),
        new Date(dateToHistory),
        exchange,
      )

      for (let currencyPair of currencyPairs) {
        let openInterestsByPairId = openInterestsData.filter(
          (item) => item.pairId === currencyPair.id,
        )

        if (openInterestsByPairId.length > 0) {
          let avarageOpenInterestsDataByPairId = avarageOpenInterestsData.find(
            (item) => item.pairId === currencyPair.id,
          )
          if (typeof avarageOpenInterestsDataByPairId === 'undefined') {
            continue
          }
          let minOpenInterestsDataByPairId = minOpenInterestsData.find(
            (item) => item.pairId === currencyPair.id,
          )
          if (typeof minOpenInterestsDataByPairId === 'undefined') {
            continue
          }
          let maxOpenInterestsDataByPairId = maxOpenInterestsData.find(
            (item) => item.pairId === currencyPair.id,
          )
          if (typeof maxOpenInterestsDataByPairId === 'undefined') {
            continue
          }

          let diffOIpercentage =
            ((parseFloat(maxOpenInterestsDataByPairId.maxOpenInterest) -
              parseFloat(minOpenInterestsDataByPairId.minOpenInterest)) /
              maxOpenInterestsDataByPairId.maxOpenInterest) *
            100

          // let firstOpenInterests = parseInt(openInterestsByPairId.shift().value)
          let lastOpenInterest = parseInt(openInterestsByPairId.pop().value)
          let lowerOpenInterestValue = 0
          if (openInterestsByPairId.length > 0) {
            let lowerOpenInterestData = openInterestsByPairId.reduce(
              (prev, curr) => (prev.value < curr.value ? prev : curr),
            )
            lowerOpenInterestValue = parseInt(lowerOpenInterestData.value)
          }

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

          if (
            parseInt(percentagePlus) >= userSettings.percentagePlus &&
            parseInt(diffOIpercentage) < userSettings.percentageAfterSilence
          ) {
            // console.log(
            //   currencyPair.id,
            //   minOpenInterestsDataByPairId,
            //   maxOpenInterestsDataByPairId,
            //   parseFloat(maxOpenInterestsDataByPairId.maxOpenInterest),
            //   parseFloat(minOpenInterestsDataByPairId.minOpenInterest),
            //   diffOIpercentage,
            //   currencyPair.pair,
            // )
            // console.log(
            //   'currencyPair:',
            //   currencyPair.pair,
            //   'avarageOpenInterest:',
            //   avarageOpenInterestsDataByPairId.avarageOpenInterest,
            //   'percentagePlus:',
            //   percentagePlus,
            //   'diffOIpercentage:',
            //   diffOIpercentage,
            //   avarageOpenInterestsDataByPairId.avarageOpenInterest <
            //     percentagePlus,
            // )
            let lastSignalData =
              await this.#userSignalModel.getLastByUserIdPairId(
                userData.id,
                currencyPair.id,
                exchange,
              )
            let currentDate = new Date()
            const skipSignalPeriod = currentDate.setMinutes(
              currentDate.getMinutes() - userSettings.skipSignalPeriod,
            )
            console.log(skipSignalPeriod)
            if (
              lastSignalData &&
              new Date(lastSignalData.createdAt) > new Date(skipSignalPeriod)
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
            if (priceData.length > 2) {
              let lastPrice = parseFloat(priceData.pop().price).toFixed(6)
              //   let lowePriceData = priceData.reduce((prev, curr) =>
              //     prev.value < curr.value ? prev : curr,
              //   )
              //   let lowerPrice = parseFloat(lowePriceData.price).toFixed(6)
              let beforeLastPrice = parseFloat(priceData.pop().price).toFixed(6)

              let pricePlus = 0,
                priceMinus = 0
              if (lastPrice > beforeLastPrice) {
                pricePlus = parseFloat(
                  100 -
                    parseFloat(beforeLastPrice / lastPrice).toFixed(6) * 100,
                ).toFixed(2)
              } else {
                priceMinus = parseFloat(
                  100 -
                    parseFloat(lastPrice / beforeLastPrice).toFixed(6) * 100,
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
