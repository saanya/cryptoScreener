const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack} = require('~/common/ModelTools')

class UserMessageModel {
  static tableName = 'userMessage'
  static fields = ['id', 'userId', 'botType', 'message', 'createdAt']

  save(userId, botType, message, createdAt = new Date()) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserMessageModel.tableName} (userId, botType, message,  createdAt)
         VALUES(?, ?, ?, ?)`,
        [userId, botType, message, createdAt],
      )
      .then((execResult) => {
        if (!execResult || !execResult.insertId) {
          throw new Error(`Error during inserting a new user exchange settings`)
        }
        return execResult.insertId
      })
  }

  getLastByUserId(userId, botType) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserMessageModel.fields.join(',')} FROM ${
          UserMessageModel.tableName
        }
         WHERE userId = ? AND botType = ?
         ORDER BY id DESC
         LIMIT 1`,
        [userId, botType],
      )
      .then((result) => {
        if (result && result.length === 0) {
          return null
        }

        return unpack(result)
      })
  }

  deleteById(userId, botType) {
    return mysqlConnectionPool
      .query(
        `DELETE FROM ${UserMessageModel.tableName} WHERE userId = ? AND botType = ?`,
        [userId, botType],
      )
      .then((execResult) => {
        return execResult.affectedRows
      })
  }
}

exports.UserMessageModel = UserMessageModel
