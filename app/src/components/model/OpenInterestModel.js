const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpackMulti} = require('~/common/ModelTools')

class OpenInterestModel {
  static tableName = 'openInterest'
  static fields = ['pairId', 'exchange', 'value', 'createdAt']

  async saveMulti(params, exchange, createdAt = new Date()) {
    let values = []
    for (let param of params) {
      let oiValue = parseFloat(param.oi).toFixed(6)
      values.push([param.pairId, exchange, oiValue, createdAt])
    }
    const execResult = await mysqlConnectionPool.query(
      `INSERT INTO ${OpenInterestModel.tableName} (pairId, exchange, value, createdAt)
         VALUES ?`,
      [values],
    )

    if (!execResult || !execResult.affectedRows) {
      throw new Error(`Error during save new pairs`)
    }
    return execResult.affectedRows
  }

  async getByPeriod(dateFrom, exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT ${OpenInterestModel.fields.join(',')} FROM ${
          OpenInterestModel.tableName
        }
         WHERE exchange = ? AND createdAt >= ?`,
        [exchange, dateFrom],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  async getMinByPeriod(dateFrom, dateTo, exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT MIN(value) as minOpenInterest, pairId  FROM ${OpenInterestModel.tableName}
         WHERE exchange = ? AND createdAt >= ? AND createdAt < ?
         GROUP BY pairId`,
        [exchange, dateFrom, dateTo],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  async getMaxByPeriod(dateFrom, dateTo, exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT MAX(value) as maxOpenInterest, pairId FROM ${OpenInterestModel.tableName}
       WHERE exchange = ? AND createdAt >= ? AND createdAt < ?
       GROUP BY pairId`,
        [exchange, dateFrom, dateTo],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }
}

exports.OpenInterestModel = OpenInterestModel
