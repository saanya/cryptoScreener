require('module-alias/register')
require('dotenv').config()

const {MysqlPool} = require('~/common/MysqlPool')
const {PairPriceModel} = require('~/components/model/PairPriceModel')
const {OpenInterestModel} = require('~/components/model/OpenInterestModel')
const mysqlConnectionPool = new MysqlPool()

const type = process.argv.slice(2)[0]
let tableName = OpenInterestModel.tableName
switch (type) {
  case 'openInterest':
    tableName = OpenInterestModel.tableName
    break
  case 'pairPrice':
    tableName = PairPriceModel.tableName
    break
  default:
    console.log('please add type parameter')
    process.exit(0)
}

let dayBefore = new Date()
dayBefore.setDate(dayBefore.getDate() - 2)
const currentDay = dayBefore.getDate()
let dayFormatted = currentDay.toString().padStart(2, '0')
let currentMonth = dayBefore.getMonth() + 1
currentMonthFormatted = currentMonth.toString().padStart(2, '0')
let currentYear = dayBefore.getFullYear()

return mysqlConnectionPool
  .query(
    `ALTER TABLE ${tableName} DROP PARTITION 
     p${currentYear}${currentMonthFormatted}${dayFormatted}
  `,
  )
  .then((result) => {
    console.log(result)
    console.log(
      `Partitions p${currentYear}${currentMonthFormatted}${dayFormatted} drop successfully`,
    )
    process.exit(0)
  })
