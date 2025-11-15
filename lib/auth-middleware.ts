import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload; response: null } | { user: null; response: NextResponse }> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Отсутствует или неверный заголовок авторизации' },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.substring(7)
  const user = verifyToken(token)

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Неверный или просроченный токен' },
        { status: 401 }
      ),
    }
  }

  return { user, response: null }
}
