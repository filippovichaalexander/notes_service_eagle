import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { notesDb } from '../route'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const { id } = await params
    const note = notesDb.find(
      (n: Note) => n.id === parseInt(id) && n.userId === user.userId
    )

    if (!note) {
      return NextResponse.json(
        { error: 'Заметка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении заметки' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, categoryId, tags } = body

    const noteIndex = notesDb.findIndex(
      (n: Note) => n.id === parseInt(id) && n.userId === user.userId
    )

    if (noteIndex === -1) {
      return NextResponse.json(
        { error: 'Заметка не найдена' },
        { status: 404 }
      )
    }

    if (title && !title.trim()) {
      return NextResponse.json(
        { error: 'Заголовок не может быть пустым' },
        { status: 400 }
      )
    }

    notesDb[noteIndex] = {
      ...notesDb[noteIndex],
      title: title?.trim() || notesDb[noteIndex].title,
      content: content?.trim() || notesDb[noteIndex].content,
      categoryId: categoryId !== undefined ? categoryId : notesDb[noteIndex].categoryId,
      tags: Array.isArray(tags) ? tags : notesDb[noteIndex].tags,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(notesDb[noteIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка обновления заметки' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await authenticateRequest(request)
  if (!user) return response!

  try {
    const { id } = await params
    const noteIndex = notesDb.findIndex(
      (n: Note) => n.id === parseInt(id) && n.userId === user.userId
    )

    if (noteIndex === -1) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const deletedNote = notesDb.splice(noteIndex, 1)
    return NextResponse.json(deletedNote[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
