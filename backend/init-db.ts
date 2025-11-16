import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/notes_app'

async function initDB() {
  const client = new Client({
    connectionString: DATABASE_URL
  })

  try {
    await client.connect()
    console.log('Попытка подключения к PostgreSQL...')

    // Создание таблицы пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Создание таблицы заметок
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        category_id INTEGER,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Индексы для производительности
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);
      CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
    `)

    console.log('Схема базы данных успешно создана!')
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  initDB()
}

export { initDB }