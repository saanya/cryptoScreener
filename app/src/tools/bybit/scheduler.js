require('module-alias/register')
require('dotenv').config()
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {OpenInterestComponent} = require('~/components/OpenInterestComponent')

const openInterestComponent = new OpenInterestComponent()

processOpenInterests = async () => {
  setTimeout(async () => {
    await openInterestComponent.getOpenInterests(ExchangeEnum.bybit)
    console.log('BYBIT: open interest script done')
    process.exit(0)
  }, 2000)
}

processOpenInterests()
