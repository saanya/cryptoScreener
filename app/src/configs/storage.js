const mysql = {
  host: process.env.NODE_DB_HOST,
  user: process.env.NODE_DB_USER,
  password: process.env.NODE_DB_PASS,
  database: process.env.NODE_DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  port: process.env.NODE_DB_PORT,
}
exports.mysqlConnection = mysql
