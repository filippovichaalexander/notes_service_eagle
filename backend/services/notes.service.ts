import {
  Service,
  Context,
  ServiceSchema,
  ServiceSettingSchema,
} from 'moleculer'
import { Pool } from 'pg'

interface Note {
  id: number
  userId: number
  title: string
  content: string
  categoryId: number | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

type NotesServiceThis = Service & {
  pool: Pool
}

const notesService: ServiceSchema<ServiceSettingSchema, NotesServiceThis> = {
  name: 'notes',
  
  settings: {
    fields: {
      id: { type: 'number', primaryKey: true, columnName: '_id' },
      userId: 'number',
      title: 'string',
      content: 'string',
      categoryId: { type: 'number', optional: true },
      tags: { type: 'array', items: 'string', default: [] },
      createdAt: 'date',
      updatedAt: 'date',
    },
  },

  actions: {
    'list': {
      auth: 'required',
      params: {
        search: { type: 'string', optional: true },
        categoryId: { type: 'number', optional: true },
        page: { type: 'number', optional: true, default: 1 },
        limit: { type: 'number', optional: true, default: 50 },
      },
      async handler(
        this: NotesServiceThis,
        ctx: Context<{ 
          search?: string; 
          categoryId?: number;
          page?: number;
          limit?: number;
        }, { userId: number }>
      ) {
        const userId = ctx.meta.userId
        const { search, categoryId, page = 1, limit = 50 } = ctx.params
        const offset = (page - 1) * limit

        let query = `
          SELECT id, user_id as "userId", title, content, 
                 category_id as "categoryId", tags, 
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM notes 
          WHERE user_id = $1
        `
        const params: any[] = [userId]
        let paramCount = 1

        if (search) {
          paramCount++
          query += ` AND (
            title ILIKE $${paramCount} OR 
            content ILIKE $${paramCount} OR 
            EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE tag ILIKE $${paramCount})
          )`
          params.push(`%${search}%`)
        }

        if (categoryId) {
          paramCount++
          query += ` AND category_id = $${paramCount}`
          params.push(categoryId)
        }

        query += ` ORDER BY updated_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
        params.push(limit, offset)

        const result = await this.pool.query(query, params)
        return result.rows
      },
    },

    'get': {
      auth: 'required',
      params: {
        id: 'number',
      },
      async handler(
        this: NotesServiceThis,
        ctx: Context<{ id: number }, { userId: number }>
      ) {
        const result = await this.pool.query(
          `SELECT id, user_id as "userId", title, content, 
                  category_id as "categoryId", tags, 
                  created_at as "createdAt", updated_at as "updatedAt"
           FROM notes 
           WHERE id = $1 AND user_id = $2`,
          [ctx.params.id, ctx.meta.userId]
        )

        if (result.rows.length === 0) {
          throw new Error('Заметка не найдена')
        }

        return result.rows[0]
      },
    },

    'create': {
      auth: 'required',
      params: {
        title: 'string',
        content: { type: 'string', optional: true },
        categoryId: { type: 'number', optional: true },
        tags: { type: 'array', items: 'string', default: [] },
      },
      async handler(
        this: NotesServiceThis,
        ctx: Context<
          {
            title: string
            content?: string
            categoryId?: number
            tags?: string[]
          },
          { userId: number }
        >
      ) {
        const { title, content, categoryId, tags } = ctx.params
        
        if (!title?.trim()) {
          throw new Error('Заголовок обязателен')
        }

        const result = await this.pool.query(
          `INSERT INTO notes (user_id, title, content, category_id, tags)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, user_id as "userId", title, content, 
                     category_id as "categoryId", tags, 
                     created_at as "createdAt", updated_at as "updatedAt"`,
          [ctx.meta.userId, title.trim(), content?.trim() || '', categoryId || null, tags || []]
        )

        return result.rows[0]
      },
    },

    'update': {
      auth: 'required',
      params: {
        id: 'number',
        title: { type: 'string', optional: true },
        content: { type: 'string', optional: true },
        categoryId: { type: 'number', optional: true },
        tags: { type: 'array', items: 'string', optional: true },
      },
      async handler(
        this: NotesServiceThis,
        ctx: Context<
          {
            id: number
            title?: string
            content?: string
            categoryId?: number
            tags?: string[]
          },
          { userId: number }
        >
      ) {
        const { id, title, content, categoryId, tags } = ctx.params

        // Проверяем существование заметки и принадлежность пользователю
        const checkResult = await this.pool.query(
          'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
          [id, ctx.meta.userId]
        )

        if (checkResult.rows.length === 0) {
          throw new Error('Заметка не найдена')
        }

        const updates: string[] = []
        const params: any[] = []
        let paramCount = 0

        if (title !== undefined) {
          paramCount++
          updates.push(`title = $${paramCount}`)
          params.push(title.trim())
        }

        if (content !== undefined) {
          paramCount++
          updates.push(`content = $${paramCount}`)
          params.push(content.trim())
        }

        if (categoryId !== undefined) {
          paramCount++
          updates.push(`category_id = $${paramCount}`)
          params.push(categoryId)
        }

        if (tags !== undefined) {
          paramCount++
          updates.push(`tags = $${paramCount}`)
          params.push(tags)
        }

        if (updates.length === 0) {
          throw new Error('Нет полей для обновления')
        }

        paramCount++
        updates.push(`updated_at = CURRENT_TIMESTAMP`)
        
        paramCount++
        params.push(id)
        paramCount++
        params.push(ctx.meta.userId)

        const result = await this.pool.query(
          `UPDATE notes 
           SET ${updates.join(', ')}
           WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
           RETURNING id, user_id as "userId", title, content, 
                     category_id as "categoryId", tags, 
                     created_at as "createdAt", updated_at as "updatedAt"`,
          params
        )

        return result.rows[0]
      },
    },

    'remove': {
      auth: 'required',
      params: {
        id: 'number',
      },
      async handler(
        this: NotesServiceThis,
        ctx: Context<{ id: number }, { userId: number }>
      ) {
        const result = await this.pool.query(
          `DELETE FROM notes 
           WHERE id = $1 AND user_id = $2
           RETURNING id, user_id as "userId", title, content, 
                     category_id as "categoryId", tags, 
                     created_at as "createdAt", updated_at as "updatedAt"`,
          [ctx.params.id, ctx.meta.userId]
        )

        if (result.rows.length === 0) {
          throw new Error('Заметка не найдена')
        }

        return result.rows[0]
      },
    },
  },

  created(this: NotesServiceThis) {
    // Инициализация пула соединений с PostgreSQL
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    console.log('✅ PostgreSQL pool created for notes service')
  },

  stopped(this: NotesServiceThis) {
    if (this.pool) {
      this.pool.end()
      console.log('✅ PostgreSQL pool closed')
    }
  },
}

export default notesService