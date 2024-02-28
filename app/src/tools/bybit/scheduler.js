require('module-alias/register')
require('dotenv').config()
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {OpenInterestComponent} = require('~/components/OpenInterestComponent')

const openInterestComponent = new OpenInterestComponent()

processOpenInterests = async () => {
  const start = Date.now()
  await openInterestComponent.getOpenInterests(ExchangeEnum.bybit)
  const end = Date.now()
  console.log(
    `BYBIT: open interest script done  Execution time: ${
      end - start
    } ms ${new Date()}`,
  )
  process.exit(0)
}

processOpenInterests()
