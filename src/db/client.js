const mysql = require('mysql2/promise');
const env = require('../config/env');

// Parseamos la URL de la base de datos para extraer los componentes
// Soporta formato: mysql://user:password@host:port/database
function parseConnectionString(connectionString) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
  };
}

const pool = mysql.createPool({
  ...parseConnectionString(env.databaseUrl),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+00:00', // Usar UTC para timestamps
  supportBigNumbers: true,
  bigNumberStrings: false,
  dateStrings: false,
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('MariaDB connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB:', err);
    process.exit(-1);
  });

// Adapter para mantener compatibilidad con el código existente
module.exports = {
  query: async (text, params) => {
    // MySQL2 usa ? como placeholder, no $1, $2, etc.
    // Convertimos los placeholders de PostgreSQL a MySQL
    let mysqlQuery = text;
    if (params && params.length > 0) {
      let paramIndex = 0;
      mysqlQuery = text.replace(/\$\d+/g, () => {
        paramIndex++;
        return '?';
      });
    }

    const [rows] = await pool.execute(mysqlQuery, params);
    return { rows };
  },
  getClient: async () => {
    const connection = await pool.getConnection();
    return {
      query: async (text, params) => {
        let mysqlQuery = text;
        if (params && params.length > 0) {
          let paramIndex = 0;
          mysqlQuery = text.replace(/\$\d+/g, () => {
            paramIndex++;
            return '?';
          });
        }
        const [rows] = await connection.execute(mysqlQuery, params);
        return { rows };
      },
      release: () => connection.release(),
    };
  },
  pool,
};
