'use strict'

var dbm
var type
var seed

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async function (db) {
  await db.runSql(
    'alter table userSettings CHANGE COLUMN periodMinus periodSilence smallint unsigned NOT NULL',
  )
  await db.runSql(
    'alter table userSettings CHANGE COLUMN percentageMinus percentageAfterSilence smallint unsigned NOT NULL',
  )
  await db.runSql(
    'alter table userSettings ADD COLUMN skipSignalPeriod smallint unsigned NOT NULL after percentageAfterSilence',
  )
}

exports.down = function (db) {
  return null
}

exports._meta = {
  version: 1,
}
