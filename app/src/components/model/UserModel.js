const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')
const {UserStatusEnum} = require('~/enum/UserStatusEnum')

class UserModel {
  static tableName = 'user'
  static fields = [
    'id',
    'telegramId',
    'chatId',
    'nickName',
    'name',
    'status',
    'createdAt',
  ]

  save(
    telegramId,
    chatId,
    nickName,
    name,
    status = UserStatusEnum.active,
    createdAt = new Date(),
  ) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserModel.tableName} (telegramId, chatId, nickName, name, status, createdAt)
         VALUES(?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE chatId = ?`,
        [telegramId, chatId, nickName, name, status, createdAt, chatId],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user settings`)
        }
        return execResult.affectedRows
      })
  }

  getByTelegramId(telegramId) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserModel.fields.join(',')} FROM ${UserModel.tableName}
         WHERE telegramId = ?`,
        [telegramId],
      )
      .then((result) => {
        if (result && result.length === 0) {
          return null
        }

        return unpack(result)
      })
  }

  getByIds(ids) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserModel.fields.join(',')} FROM ${UserModel.tableName}
         WHERE id in (?)`,
        [ids],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  getAll(status = UserStatusEnum.active) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserModel.fields.join(',')} FROM ${
          UserModel.tableName
        } WHERE status = ?`,
        [status],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }
}

exports.UserModel = UserModel
