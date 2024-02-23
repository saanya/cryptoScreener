const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpackMulti} = require('~/common/ModelTools')

class CurrencyPairModel {
  static tableName = 'currencyPair'
  static fields = ['id', 'pair', 'exchange', 'createdAt']

  async saveMulti(pairs, exchange, createdAt) {
    let values = []
    for (let pair of pairs) {
      values.push([pair, exchange, createdAt])
    }
    const execResult = await mysqlConnectionPool.query(
      `INSERT INTO ${CurrencyPairModel.tableName} (pair, exchange, createdAt)
         VALUES ? AS new
         ON DUPLICATE KEY UPDATE pair = new.pair`,
      [values],
    )
    if (!execResult || !execResult.affectedRows) {
      throw new Error(`Error during save new pairs`)
    }
    return execResult.affectedRows
  }

  async getByExchange(exchange) {
    return mysqlConnectionPool
      .query(
        `SELECT ${CurrencyPairModel.fields.join(',')} FROM ${
          CurrencyPairModel.tableName
        }
         WHERE exchange = ?`,
        [exchange],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }
}

exports.CurrencyPairModel = CurrencyPairModel
