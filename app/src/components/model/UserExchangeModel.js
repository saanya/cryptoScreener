const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpackMulti} = require('~/common/ModelTools')

class UserExchangeModel {
  static tableName = 'userExchange'
  static fields = ['userId', 'botType', 'exchange', 'status', 'createdAt']

  save(userId, botType, exchange, status, createdAt = new Date()) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserExchangeModel.tableName} (userId, botType, exchange, status, createdAt)
         VALUES(?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?`,
        [userId, botType, exchange, status, createdAt, status],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user exchange settings`)
        }
        return execResult.affectedRows
      })
  }

  getByUserId(userId, botType) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserExchangeModel.fields.join(',')} FROM ${
          UserExchangeModel.tableName
        }
         WHERE userId = ? and botType = ?`,
        [userId, botType],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  getByUserIds(userIds, botType, exchange = null) {
    let where = ['userId IN (?)', 'botType = ?']
    let params = [userIds, botType]

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
