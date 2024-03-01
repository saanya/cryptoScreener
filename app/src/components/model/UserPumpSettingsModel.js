const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')

class UserPumpSettingsModel {
  static tableName = 'userPumpSettings'
  static fields = [
    'userId',
    'periodPlus',
    'percentagePlus',
    'skipSignalPeriod',
    'skipSignalCount',
    'createdAt',
  ]

  save(
    userId,
    periodPlus,
    percentagePlus,
    skipSignalPeriod,
    skipSignalCount,
    createdAt = new Date(),
  ) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserPumpSettingsModel.tableName} (userId, periodPlus, percentagePlus, skipSignalPeriod, skipSignalCount, createdAt)
         VALUES(?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE periodPlus = ?, percentagePlus = ?, skipSignalPeriod = ?, skipSignalCount = ?`,
        [
          userId,
          periodPlus,
          percentagePlus,
          skipSignalPeriod,
          skipSignalCount,
          createdAt,
          periodPlus,
          percentagePlus,
          skipSignalPeriod,
          skipSignalCount,
        ],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user settings pump`)
        }
        return execResult.affectedRows
      })
  }

  getByUserId(userId) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserPumpSettingsModel.fields.join(',')} FROM ${
          UserPumpSettingsModel.tableName
        }
         WHERE userId = ?`,
        [userId],
      )
      .then((result) => {
        if (result && result.length === 0) {
          return null
        }

        return unpack(result)
      })
  }

  getByUserIds(userIds) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserPumpSettingsModel.fields.join(',')} FROM ${
          UserPumpSettingsModel.tableName
        }
         WHERE userId IN (?)`,
        [userIds],
      )
      .then((results) => {
        if (results && results.length === 0) {
          return []
        }

        return unpackMulti(results)
      })
  }

  updateByUserId(userId, data) {
    if (!userId || !data) {
      return false
    }

    return this.prepareDataForUpdating(data).then((result) => {
      if (result.params.length === 0) {
        return 0
      }

      return mysqlConnectionPool
        .query(
          `UPDATE ${UserPumpSettingsModel.tableName} SET ${result.fields.join(
            ',',
          )} WHERE userId=?`,
          [...result.params, userId],
        )
        .then((execResult) => {
          return execResult?.changedRows || 0
        })
    })
  }

  prepareDataForUpdating(data) {
    return new Promise((resolve, reject) => {
      let result = {
        fields: [],
        params: [],
      }

      if (Object.hasOwnProperty.bind(data)('periodPlus')) {
        result.fields = [...result.fields, 'periodPlus=?']
        result.params = [...result.params, data.periodPlus]
      }
      if (Object.hasOwnProperty.bind(data)('percentagePlus')) {
        result.fields = [...result.fields, 'percentagePlus=?']
        result.params = [...result.params, data.percentagePlus]
      }
      if (Object.hasOwnProperty.bind(data)('skipSignalPeriod')) {
        result.fields = [...result.fields, 'skipSignalPeriod=?']
        result.params = [...result.params, data.skipSignalPeriod]
      }
      if (Object.hasOwnProperty.bind(data)('skipSignalCount')) {
        result.fields = [...result.fields, 'skipSignalCount=?']
        result.params = [...result.params, data.skipSignalCount]
      }

      resolve(result)
    })
  }
}

exports.UserPumpSettingsModel = UserPumpSettingsModel
