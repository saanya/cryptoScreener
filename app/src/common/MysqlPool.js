const {mysqlConnection} = require('~/configs/storage')
const mysql = require('mysql2')
const mysqlConnectionRoot = mysql.createPool(mysqlConnection)

class MysqlPool {
  async query(sql, param) {
    return new Promise((resolve, reject) => {
      return mysqlConnectionRoot.getConnection(function (err, connection) {
        if (err) {
          console.log(err)
          throw new Error('Error in connection database')
        }
        return connection
          .promise()
          .query(sql, param)
          .then(([rows, fields]) => {
            connection.release()
            return resolve(rows)
          })
      })
    })
  }
}

exports.MysqlPool = MysqlPool
