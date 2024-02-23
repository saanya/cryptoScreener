require('module-alias/register')
require('dotenv').config()

const {BinanceComponent} = require('~/components/binance/BinanceComponent')
const {CurrencyPairModel} = require('~/components/model/CurrencyPairModel')
const {ExchangeEnum} = require('~/enum/ExchangeEnum')

const binanceComponent = new BinanceComponent()
const currencyPairModel = new CurrencyPairModel()

processSaveCurrencyPairs = async () => {
  let symbols = await binanceComponent.getAllUsdtSymbols()
  await currencyPairModel.saveMulti(symbols, ExchangeEnum.binance, new Date())
  console.log('done')
  process.exit(0)
}

processSaveCurrencyPairs()
