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
    `CREATE TABLE IF NOT EXISTS userSettings (
      userId int(11) unsigned NOT NULL,
      periodPlus smallint(4) unsigned NOT NULL,
      periodMinus smallint(4) unsigned NOT NULL,
      percentagePlus smallint(4) unsigned NOT NULL,
      percentageMinus smallint(4) unsigned NOT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY userId(userId),
      KEY createdAt(createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
  )
}

exports.down = function (db) {
  return null
}

exports._meta = {
  version: 1,
}
