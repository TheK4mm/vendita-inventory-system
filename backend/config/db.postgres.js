const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT) || 5432,
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'tienda_db',
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id         SERIAL PRIMARY KEY,
        nombre     VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        rol        VARCHAR(20)  NOT NULL DEFAULT 'usuario',
        activo     BOOLEAN      NOT NULL DEFAULT true,
        created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla auxiliar para tokens de recuperación de contraseña
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id          SERIAL PRIMARY KEY,
        usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token_hash  VARCHAR(255) NOT NULL,
        expires_at  TIMESTAMP NOT NULL,
        used        BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (token_hash);`);

    client.release();
    console.log('✅ PostgreSQL conectado correctamente');
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    throw err;
  }
};

module.exports = connectPostgres;
module.exports.pool = pool;
