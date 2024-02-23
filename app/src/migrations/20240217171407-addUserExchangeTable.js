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
    `CREATE TABLE IF NOT EXISTS userExchange (
      userId int(11) unsigned NOT NULL,
      exchange enum('BINANCE','BYBIT') COLLATE utf8mb4_bin NOT NULL,
      status enum('ENABLED','DISABLED') COLLATE utf8mb4_bin NOT NULL DEFAULT 'ENABLED',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY userIdExchange(userId, exchange),
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
