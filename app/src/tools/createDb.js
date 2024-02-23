require('module-alias/register')
require('dotenv').config()

const {mysqlConnection} = require('~/configs/storage')
const mysql = require('mysql2')

let dbSettings = JSON.parse(JSON.stringify(mysqlConnection))
delete dbSettings.database
console.log(dbSettings)
// create the connection to database
const rootMysqlConnectionPool = mysql.createPool(dbSettings)
rootMysqlConnectionPool.getConnection(function (err, connection) {
  if (err) {
    console.log('Error in connection database', err)
    return
  }
  console.log(mysqlConnection.database)
  connection
    .promise()
    .query(
      `CREATE DATABASE IF NOT EXISTS ${mysqlConnection.database} DEFAULT CHARACTER SET utf8mb4`,
    )
    .then((result) => {
      console.log('Done.')
      process.exit(0)
    })
})
