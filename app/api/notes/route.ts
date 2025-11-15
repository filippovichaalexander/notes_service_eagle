import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'

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

export let notesDb: Note[] = [
  {
    id: 1,
    userId: 1,
    title: 'Добро пожаловать в Notes App',
    content: 'Это простое приложение для заметок. Вы можете создавать, редактировать и удалять заметки.',
    categoryId: null,
    tags: ['welcome', 'getting-started'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export let nextId = 2

export async function GET(request: NextRequest) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  const url = new URL(request.url)
  const search = url.searchParams.get('search')?.toLowerCase()

  let userNotes = notesDb.filter(n => n.userId === user.userId)

  if (search) {
    userNotes = userNotes.filter(
      note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        note.tags.some(tag => tag.toLowerCase().includes(search))
    )
  }

  return NextResponse.json(userNotes)
}

export async function POST(request: NextRequest) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const body = await request.json()
    const { title, content, categoryId, tags } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const newNote: Note = {
      id: nextId++,
      userId: user.userId,
      title: title.trim(),
      content: content?.trim() || '',
      categoryId: categoryId || null,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    notesDb.push(newNote)
    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка создания заметки' },
      { status: 500 }
    )
  }
}
