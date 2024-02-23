require('module-alias/register')
require('dotenv').config()

const {BinanceComponent} = require('~/components/binance/BinanceComponent')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {OpenInterestModel} = require('~/components/model/OpenInterestModel')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')

const binanceComponent = new BinanceComponent()
const currencyPairModel = new CurrencyPairModel()
const openInterestModel = new OpenInterestModel()

processOpenInterest = async () => {
  const start = Date.now()
  try {
    let currencyPairs = await currencyPairModel.getByExchange(
      ExchangeEnum.binance,
    )

    let promises = []
    for (let currencyPair of currencyPairs) {
      promises.push(binanceComponent.getOpenInterest(currencyPair.pair))
    }
    let openInterests = await Promise.allSettled(promises)
    let openInterestResult = []
    for (let openInterest of openInterests) {
      if (openInterest.value) {
        for (let currencyPair of currencyPairs) {
          if (openInterest.value.symbol === currencyPair.pair) {
            openInterestResult.push({
              pairId: currencyPair.id,
              oi: openInterest.value.openInterest,
            })
          }
        }
      }
    }
    if (openInterestResult.length > 0) {
      await openInterestModel.saveMulti(
        openInterestResult,
        ExchangeEnum.binance,
        new Date(),
      )
    }
  } catch (error) {
    console.log(error)
  }
  const end = Date.now()
  console.log(`BINANCE: open interests done, Execution time: ${end - start} ms`)
  process.exit(0)
}

processOpenInterest()
