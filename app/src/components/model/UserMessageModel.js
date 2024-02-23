const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack} = require('~/common/ModelTools')

class UserMessageModel {
  static tableName = 'userMessage'
  static fields = ['id', 'userId', 'message', 'createdAt']

  save(userId, message, createdAt = new Date()) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserMessageModel.tableName} (userId, message, createdAt)
         VALUES(?, ?, ?)`,
        [userId, message, createdAt],
      )
      .then((execResult) => {
        if (!execResult || !execResult.insertId) {
          throw new Error(`Error during inserting a new user exchange settings`)
        }
        return execResult.insertId
      })
  }

  getLastByUserId(userId) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserMessageModel.fields.join(',')} FROM ${
          UserMessageModel.tableName
        }
         WHERE userId = ?
         ORDER BY id DESC
         LIMIT 1`,
        [userId],
      )
      .then((result) => {
        if (result && result.length === 0) {
          return null
        }

        return unpack(result)
      })
  }

  deleteById(userId) {
    return mysqlConnectionPool
      .query(`DELETE FROM ${UserMessageModel.tableName} WHERE userId = ?`, [
        userId,
      ])
      .then((execResult) => {
        return execResult.affectedRows
      })
  }
}

exports.UserMessageModel = UserMessageModel
