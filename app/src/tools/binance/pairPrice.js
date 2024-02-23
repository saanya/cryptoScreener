require('module-alias/register')
require('dotenv').config()

const {BinanceComponent} = require('~/components/binance/BinanceComponent')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {PairPriceModel} = require('~/components/model/PairPriceModel')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')

const binanceComponent = new BinanceComponent()
const currencyPairModel = new CurrencyPairModel()
const pairPriceModel = new PairPriceModel()

processPairPrice = async () => {
  const start = Date.now()
  try {
    let currencyPairs = await currencyPairModel.getByExchange(
      ExchangeEnum.binance,
    )

    let pricesData = await binanceComponent.getAllPairPrice()
    let pricesResult = []
    for (let currencyPair of currencyPairs) {
      for (let priceData of pricesData) {
        if (currencyPair.pair === priceData.symbol) {
          pricesResult.push({
            pairId: currencyPair.id,
            price: priceData.price,
          })
        }
      }
    }
    if (pricesResult.length > 0) {
      await pairPriceModel.saveMulti(
        pricesResult,
        ExchangeEnum.binance,
        new Date(),
      )
    }
  } catch (error) {
    console.log(error)
  }
  const end = Date.now()
  console.log(`BINANCE: pair price done, Execution time: ${end - start} ms`)
  process.exit(0)
}

processPairPrice()
