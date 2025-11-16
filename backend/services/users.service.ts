import { Service, Context, ServiceSchema, ServiceSettingSchema } from 'moleculer'
import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Pool } from 'pg'

interface User {
  id: number
  email: string
  password: string
  createdAt: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

type UsersServiceThis = Service & {
  pool: Pool
}

const usersService: ServiceSchema<ServiceSettingSchema, UsersServiceThis> = {
  name: 'users',

  settings: {
    fields: {
      id: { type: 'number', primaryKey: true },
      email: 'string',
      password: 'string',
      createdAt: 'date',
    },
  },

  actions: {
    'register': {
      params: {
        email: 'string',
        password: 'string',
      },
      async handler(
        this: UsersServiceThis,
        ctx: Context<{ email: string; password: string }>
      ): Promise<{ user: { id: number; email: string }; token: string }> {
        const { email, password } = ctx.params

        if (!email?.trim() || !password?.trim()) {
          throw new Error('Email and password required')
        }

        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex')

        try {
          const result = await this.pool.query(
            `INSERT INTO users (email, password) 
             VALUES ($1, $2) 
             RETURNING id, email, created_at as "createdAt"`,
            [email.trim(), hashedPassword]
          )

          const user = result.rows[0]

          const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          return {
            user: { id: user.id, email: user.email },
            token,
          }
        } catch (error: any) {
          if (error.code === '23505') {
            throw new Error('Пользователь уже существует')
          }
          throw error
        }
      },
    },

    'login': {
      params: {
        email: 'string',
        password: 'string',
      },
      async handler(
        this: UsersServiceThis,
        ctx: Context<{ email: string; password: string }>
      ): Promise<{ user: { id: number; email: string }; token: string }> {
        const { email, password } = ctx.params

        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex')

        const result = await this.pool.query(
          'SELECT id, email, password FROM users WHERE email = $1',
          [email]
        )

        if (result.rows.length === 0) {
          throw new Error('Invalid credentials')
        }

        const user = result.rows[0]

        if (user.password !== hashedPassword) {
          throw new Error('Invalid credentials')
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        return {
          user: { id: user.id, email: user.email },
          token,
        }
      },
    },

    'verify': {
      params: {
        token: 'string',
      },
      handler(
        this: UsersServiceThis,
        ctx: Context<{ token: string }>
      ): string | JwtPayload {
        try {
          const decoded = jwt.verify(ctx.params.token, JWT_SECRET)
          return decoded
        } catch (err) {
          throw new Error('Invalid token')
        }
      },
    },
  },

  created(this: UsersServiceThis) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    console.log('✅ PostgreSQL pool создан для сервиса пользователей')
  },

  stopped(this: UsersServiceThis) {
    if (this.pool) {
      this.pool.end()
    }
  },
}

export default usersService
