import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/jwt'
import crypto from 'crypto'

interface User {
  id: number
  email: string
  password: string
  createdAt: string
}

let usersDb: User[] = []
let nextUserId = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    if (usersDb.some(u => u.email === email)) {
      return NextResponse.json(
        { error: 'Пользователь уже существует' },
        { status: 409 }
      )
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    const newUser: User = {
      id: nextUserId++,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    usersDb.push(newUser)

    const token = signToken({ userId: newUser.id, email: newUser.email })

    return NextResponse.json(
      {
        user: { id: newUser.id, email: newUser.email },
        token,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Регистрация не удалась' },
      { status: 500 }
    )
  }
}

export { usersDb, nextUserId }
