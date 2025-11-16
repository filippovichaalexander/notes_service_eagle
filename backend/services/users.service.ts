import { Service, Context, ServiceSchema, ServiceSettingSchema } from 'moleculer'
import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface User {
  id: number
  email: string
  password: string
  createdAt: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

type UsersServiceThis = Service & {
  users: User[]
  nextUserId: number
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
      handler(
        this: UsersServiceThis,
        ctx: Context<{ email: string; password: string }>
      ): { user: { id: number; email: string }; token: string } {
        const { email, password } = ctx.params

        if (!email?.trim() || !password?.trim()) {
          throw new Error('Email and password required')
        }

        if (this.users.find((u: User) => u.email === email)) {
          throw new Error('Пользователь уже существует')
        }

        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex')

        const newUser: User = {
          id: ++this.nextUserId,
          email,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        }

        this.users.push(newUser)

        const token = jwt.sign(
          { userId: newUser.id, email: newUser.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        return {
          user: { id: newUser.id, email: newUser.email },
          token,
        }
      },
    },

    'login': {
      params: {
        email: 'string',
        password: 'string',
      },
      handler(
        this: UsersServiceThis,
        ctx: Context<{ email: string; password: string }>
      ): { user: { id: number; email: string }; token: string } {
        const { email, password } = ctx.params

        const user = this.users.find((u: User) => u.email === email)
        if (!user) {
          throw new Error('Invalid credentials')
        }

        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex')

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
    this.users = []
    this.nextUserId = 0
  },
}

export default usersService
