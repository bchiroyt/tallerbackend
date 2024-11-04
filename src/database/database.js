import 'dotenv/config' 
import pg from 'pg'  

const { Pool } = pg 

const connectionString = process.env.DATABASE_URL  

export const db = new Pool({
  allowExitOnIdle: true,  
  connectionString,
  charset: 'utf8'
});

try {
  await db.query('SELECT NOW()') 
  console.log('Conectado a la base de datos')  
} catch (error) {
  console.log(error)  
}


