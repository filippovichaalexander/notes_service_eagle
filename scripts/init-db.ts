import { neon } from '@neondatabase/serverless'

async function initializeDatabase() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    console.log('Инициализация базы данных...')

    // создание таблицы пользователей
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // создание таблицы категорий
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, name)
      )
    `

    // создание таблицы заметок
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category_id INTEGER,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `

    // создание индексов
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`

    console.log('База данных успешно инициализирована')
  } catch (error) {
    console.error('База данных не инициализирована:', error)
    process.exit(1)
  }
}

initializeDatabase()
