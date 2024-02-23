const {MysqlPool} = require('~/common/MysqlPool')
const mysqlConnectionPool = new MysqlPool()
const {unpack, unpackMulti} = require('~/common/ModelTools')

class UserSettingsModel {
  static tableName = 'userSettings'
  static fields = [
    'userId',
    'periodPlus',
    'periodMinus',
    'percentagePlus',
    'percentageMinus',
    'createdAt',
  ]

  save(
    userId,
    periodPlus,
    periodMinus,
    percentagePlus,
    percentageMinus,
    createdAt = new Date(),
  ) {
    return mysqlConnectionPool
      .query(
        `INSERT INTO ${UserSettingsModel.tableName} (userId, periodPlus, periodMinus, percentagePlus, percentageMinus, createdAt)
         VALUES(?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE periodPlus = ?, periodMinus = ?, percentageMinus = ?, percentageMinus = ?`,
        [
          userId,
          periodPlus,
          periodMinus,
          percentagePlus,
          percentageMinus,
          createdAt,
          periodPlus,
          periodMinus,
          percentagePlus,
          percentageMinus,
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
      if (Object.hasOwnProperty.bind(data)('periodMinus')) {
        result.fields = [...result.fields, 'periodMinus=?']
        result.params = [...result.params, data.periodMinus]
      }
      if (Object.hasOwnProperty.bind(data)('percentagePlus')) {
        result.fields = [...result.fields, 'percentagePlus=?']
        result.params = [...result.params, data.percentagePlus]
      }
      if (Object.hasOwnProperty.bind(data)('percentageMinus')) {
        result.fields = [...result.fields, 'percentageMinus=?']
        result.params = [...result.params, data.percentageMinus]
      }

      resolve(result)
    })
  }
}

exports.UserSettingsModel = UserSettingsModel
