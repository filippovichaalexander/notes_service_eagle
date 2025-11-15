import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'

interface Category {
  id: number
  userId: number
  name: string
  color: string
  createdAt: string
}

export let categoriesDb: Category[] = []
export let nextCategoryId = 1

export async function GET(request: NextRequest) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  const userCategories = categoriesDb.filter(c => c.userId === user.userId)
  return NextResponse.json(userCategories)
}

export async function POST(request: NextRequest) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const body = await request.json()
    const { name, color } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Название категории обязательно' },
        { status: 400 }
      )
    }

    const newCategory: Category = {
      id: nextCategoryId++,
      userId: user.userId,
      name: name.trim(),
      color: color || '#3b82f6',
      createdAt: new Date().toISOString(),
    }

    categoriesDb.push(newCategory)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка создания категории' },
      { status: 500 }
    )
  }
}
