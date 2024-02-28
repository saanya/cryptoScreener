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

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

const date = new Date()
const currentYear = date.getFullYear()
const currentMonth = date.getMonth() + 1 // 👈️ months are 0-based

// 👇️ Current Month
const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth)
currentMonthFormatted = currentMonth.toString().padStart(2, '0')
console.log(currentYear, currentMonthFormatted, daysInCurrentMonth)

let partitions = []
for (let i = 1; i <= daysInCurrentMonth; i++) {
  let dayFormatted = i.toString().padStart(2, '0')
  partitions.push(
    `PARTITION p${currentYear}${currentMonthFormatted}${dayFormatted} VALUES LESS THAN (UNIX_TIMESTAMP('${currentYear}-${currentMonthFormatted}-${dayFormatted} 00:00:00'))`,
  )
}
partitions.push('PARTITION pMax VALUES LESS THAN (MAXVALUE)')

return mysqlConnectionPool
  .query(
    `ALTER TABLE ${tableName} PARTITION BY RANGE(UNIX_TIMESTAMP(createdAt)) (
        ${partitions.join(', ')}
  );
  `,
  )
  .then((result) => {
    console.log(result)
    console.log('Partitions added successfully')
    process.exit(0)
  })
