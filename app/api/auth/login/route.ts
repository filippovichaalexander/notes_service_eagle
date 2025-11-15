import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/jwt'
import crypto from 'crypto'
import { usersDb } from '../register/route'

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

    const user = usersDb.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'Неверные учетные данные' },
        { status: 401 }
      )
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Неверные учетные данные' },
        { status: 401 }
      )
    }

    const token = signToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      token,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Вход не удалось' },
      { status: 500 }
    )
  }
}
