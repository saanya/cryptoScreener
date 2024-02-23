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
    `CREATE TABLE IF NOT EXISTS user (
      id int(11) unsigned NOT NULL AUTO_INCREMENT,
      telegramId int(11) unsigned NOT NULL,
      chatId int(11) unsigned NOT NULL,
      nickName varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
      name varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY telegramId(telegramId),
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
