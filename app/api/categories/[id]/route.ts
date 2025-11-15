import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { categoriesDb } from '../route'

interface Category {
  id: number
  userId: number
  name: string
  color: string
  createdAt: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const { id } = await params
    const categoryIndex = categoriesDb.findIndex(
      (c: Category) => c.id === parseInt(id) && c.userId === user.userId
    )

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    const deletedCategory = categoriesDb.splice(categoryIndex, 1)
    return NextResponse.json(deletedCategory[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка удаления категории' },
      { status: 500 }
    )
  }
}
