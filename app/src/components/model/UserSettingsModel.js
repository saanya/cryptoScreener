const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')

class UserSettingsModel {
  static tableName = 'userSettings'
  static fields = [
    'userId',
    'periodPlus',
    'periodSilence',
    'percentagePlus',
    'percentageAfterSilence',
    'skipSignalPeriod',
    'createdAt',
  ]

  save(
    userId,
    periodPlus,
    periodSilence,
    percentagePlus,
    percentageAfterSilence,
    skipSignalPeriod,
    createdAt = new Date(),
  ) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserSettingsModel.tableName} (userId, periodPlus, periodSilence, percentagePlus, percentageAfterSilence, skipSignalPeriod, createdAt)
         VALUES(?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE periodPlus = ?, periodSilence = ?, percentagePlus = ?, percentageAfterSilence = ?, skipSignalPeriod =?`,
        [
          userId,
          periodPlus,
          periodSilence,
          percentagePlus,
          percentageAfterSilence,
          skipSignalPeriod,
          createdAt,
          periodPlus,
          periodSilence,
          percentagePlus,
          percentageAfterSilence,
          skipSignalPeriod,
        ],
      )
      .then((execResult) => {
        if (!execResult || !execResult.affectedRows) {
          throw new Error(`Error during inserting a new user settings`)
        }
        return execResult.affectedRows
      })
  }

  getByUserId(userId) {
    return mysqlConnectionPool
      .query(
        `SELECT ${UserSettingsModel.fields.join(',')} FROM ${
          UserSettingsModel.tableName
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
        `SELECT ${UserSettingsModel.fields.join(',')} FROM ${
          UserSettingsModel.tableName
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
          `UPDATE ${UserSettingsModel.tableName} SET ${result.fields.join(
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
      if (Object.hasOwnProperty.bind(data)('periodSilence')) {
        result.fields = [...result.fields, 'periodSilence=?']
        result.params = [...result.params, data.periodSilence]
      }
      if (Object.hasOwnProperty.bind(data)('percentagePlus')) {
        result.fields = [...result.fields, 'percentagePlus=?']
        result.params = [...result.params, data.percentagePlus]
      }
      if (Object.hasOwnProperty.bind(data)('percentageAfterSilence')) {
        result.fields = [...result.fields, 'percentageAfterSilence=?']
        result.params = [...result.params, data.percentageAfterSilence]
      }
      if (Object.hasOwnProperty.bind(data)('skipSignalPeriod')) {
        result.fields = [...result.fields, 'skipSignalPeriod=?']
        result.params = [...result.params, data.skipSignalPeriod]
      }

      resolve(result)
    })
  }
}

exports.UserSettingsModel = UserSettingsModel
