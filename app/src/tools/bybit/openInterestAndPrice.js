require('module-alias/register')
require('dotenv').config()

const {BybitComponent} = require('~/components/bybit/BybitComponent')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {OpenInterestModel} = require('~/components/model/OpenInterestModel')
const {PairPriceModel} = require('~/components/model/PairPriceModel')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')

const bybitComponent = new BybitComponent()
const currencyPairModel = new CurrencyPairModel()
const openInterestModel = new OpenInterestModel()
const pairPriceModel = new PairPriceModel()

processBybitTickers = async () => {
  setTimeout(async () => {
    const start = Date.now()
    try {
      let tickersData = await bybitComponent.getTickers()
      let symbols = await bybitComponent.getAllUsdtSymbols(tickersData)
      await currencyPairModel.saveMulti(symbols, ExchangeEnum.bybit, new Date())

      let currencyPairs = await currencyPairModel.getByExchange(
        ExchangeEnum.bybit,
      )

      let openInterestResult = []
      let pricesResult = []
      for (let currencyPair of currencyPairs) {
        for (let tickerData of tickersData) {
          if (currencyPair.pair === tickerData.symbol) {
            openInterestResult.push({
              pairId: currencyPair.id,
              oi: tickerData.openInterest,
            })
            pricesResult.push({
              pairId: currencyPair.id,
              price: tickerData.lastPrice,
            })
          }
        }
      }

      if (openInterestResult.length > 0) {
        await openInterestModel.saveMulti(
          openInterestResult,
          ExchangeEnum.bybit,
          new Date(),
        )
      }

      if (pricesResult.length > 0) {
        await pairPriceModel.saveMulti(
          pricesResult,
          ExchangeEnum.bybit,
          new Date(),
        )
      }
    } catch (error) {
      console.log(error)
    }

    const end = Date.now()
    console.log(
      `BYBIT: openInterest + price done Execution time: ${end - start} ms`,
    )
    process.exit(0)
  }, 1)
}

processBybitTickers()
