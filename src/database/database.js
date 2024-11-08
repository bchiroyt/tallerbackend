import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

export const db = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

try {
  await db.query('SELECT NOW()')
  console.log('Conectado a la base de datos')
} catch (error) {
  console.error('Error al conectar a la base de datos:', error)
}


