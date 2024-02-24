const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpackMulti} = require('~/common/ModelTools')

class PairPriceModel {
  static tableName = 'pairPrice'
  static fields = ['pairId', 'exchange', 'price', 'createdAt']

  async saveMulti(params, exchange, createdAt = new Date()) {
    let values = []
    for (let param of params) {
      values.push([
        param.pairId,
        exchange,
        parseFloat(param.price).toFixed(6),
        createdAt,
      ])
    }
    const execResult = await mysqlConnectionPool.query(
      `INSERT INTO ${PairPriceModel.tableName} (pairId, exchange, price, createdAt)
         VALUES ?`,
      [values],
    )

    if (!execResult || !execResult.affectedRows) {
      throw new Error(`Error during save new price`)
    }
    return execResult.affectedRows
  }

  async getByPeriod(dateFrom, exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT ${PairPriceModel.fields.join(',')} FROM ${
          PairPriceModel.tableName
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
}

exports.PairPriceModel = PairPriceModel
