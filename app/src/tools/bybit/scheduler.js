require('module-alias/register')
require('dotenv').config()
const {ExchangeEnum} = require('~/enum/ExchangeEnum')
const {OpenInterestComponent} = require('~/components/OpenInterestComponent')
const {PumpComponent} = require('~/components/PumpComponent')

const openInterestComponent = new OpenInterestComponent()
const pumpComponent = new PumpComponent()

processOpenInterests = async () => {
  const start = Date.now()
  await openInterestComponent.getOpenInterests(ExchangeEnum.bybit)
  const end = Date.now()
  console.log(
    `BYBIT: open interest script done Execution time: ${
      end - start
    } ms ${new Date()}`,
  )
  process.exit(0)
}

processPump = async () => {
  const start = Date.now()
  setTimeout(async () => {
    await pumpComponent.processPump(ExchangeEnum.bybit)
    const end = Date.now()
    console.log(
      `BYBIT: pump script done  Execution time: ${
        end - start
      } ms ${new Date()}`,
    )
    process.exit(0)
  }, 2000)
}

const type = process.argv.slice(2)[0]
switch (type) {
  case 'openInterest':
    processOpenInterests()
    break
  case 'pump':
    processPump()
    break
  default:
    console.log('Please add type of run script pump/openInterest')
}
