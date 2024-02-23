const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')

class UserExchangeModel {
  static tableName = 'userExchange'
  static fields = ['userId', 'exchange', 'status', 'createdAt']

  save(userId, exchange, status, createdAt = new Date()) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserExchangeModel.tableName} (userId, exchange, status, createdAt)
         VALUES(?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?`,
        [userId, exchange, status, createdAt, status],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user exchange settings`)
        }
        return execResult.affectedRows
      })
  }

  getByUserId(userId) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserExchangeModel.fields.join(',')} FROM ${
          UserExchangeModel.tableName
        }
         WHERE userId = ?`,
        [userId],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  getByUserIds(userIds, exchange = null) {
    let where = ['userId IN (?)']
    let params = [userIds]

    if (exchange) {
      where = [...where, 'exchange = ?']
      params = [...params, exchange]
    }
    return mysqlConnectionPool
      .query(
        `SELECT ${UserExchangeModel.fields.join(',')} FROM ${
          UserExchangeModel.tableName
        }
         WHERE ${where.join(' AND ')}`,
        params,
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }
}

exports.UserExchangeModel = UserExchangeModel
