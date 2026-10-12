const { Pool } = require("pg")

module.exports = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '005522',
    database: 'inventory_application'
})