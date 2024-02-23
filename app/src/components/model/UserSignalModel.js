const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')

class UserSignalModel {
  static tableName = 'userSignal'
  static fields = [
    'userId',
    'pairId',
    'exchange',
    'percentagePlus',
    'percentageMinus',
    'pricePlus',
    'priceMinus',
    'createdAt',
  ]

  save(
    userId,
    pairId,
    exchange,
    percentagePlus,
    percentageMinus,
    pricePlus,
    priceMinus,
    createdAt = new Date(),
  ) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserSignalModel.tableName} (userId, pairId, exchange, percentagePlus, percentageMinus, pricePlus, priceMinus, createdAt)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          pairId,
          exchange,
          percentagePlus,
          percentageMinus,
          pricePlus,
          priceMinus,
          createdAt,
        ],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user signal`)
        }
        return execResult.affectedRows
      })
  }

  getLastByUserIdPairId(userId, pairId, exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserSignalModel.fields.join(',')} FROM ${
          UserSignalModel.tableName
        }
         WHERE userId = ? AND pairId = ? AND exchange = ?
         ORDER BY createdAt DESC 
         LIMIT 1`,
        [userId, pairId, exchange],
      )
      .then((result) => {
        if (result && result.length === 0) {
          return null
        }

        return unpack(result)
      })
  }

  getCountByDate(userId, pairId, exchange, date) {
    return mysqlConnectionPool
      .query(
        `SELECT count(*) as count
         FROM ${UserSignalModel.tableName}
         WHERE userId = ? AND pairId = ? AND exchange = ? AND createdAt > ?
        `,
        [userId, pairId, exchange, date],
      )
      .then(async (result) => {
        if (result && result.length === 0) {
          return 0
        }
        let resultUnpack = await unpack(result)
        return resultUnpack.count
      })
  }
}

exports.UserSignalModel = UserSignalModel
