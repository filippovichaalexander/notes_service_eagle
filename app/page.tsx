'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit2, X, Search, Tag } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'

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

interface Category {
  id: number
  userId: number
  name: string
  color: string
  createdAt: string
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchNotes()
      fetchCategories()
    }
  }, [token])

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  })

  const fetchNotes = async () => {
    if (!token) return
    try {
      setLoading(true)
      const url = searchQuery ? `/api/notes?search=${encodeURIComponent(searchQuery)}` : '/api/notes'
      const response = await fetch(url, {
        headers: getAuthHeader(),
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!token) return
    try {
      const response = await fetch('/api/categories', {
        headers: getAuthHeader(),
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchNotes()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, token])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setNotes([])
    setCategories([])
    setSelectedNote(null)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedNote(null)
    setTitle('')
    setContent('')
    setCategoryId(null)
    setTags([])
  }

  const handleEditNote = (note: Note) => {
    setIsEditing(true)
    setIsCreating(false)
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategoryId(note.categoryId)
    setTags(note.tags)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      if (isCreating) {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ title, content, categoryId, tags }),
        })
        if (response.ok) {
          await fetchNotes()
          setIsCreating(false)
          setTitle('')
          setContent('')
          setCategoryId(null)
          setTags([])
        }
      } else if (isEditing && selectedNote) {
        const response = await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PATCH',
          headers: getAuthHeader(),
          body: JSON.stringify({ title, content, categoryId, tags }),
        })
        if (response.ok) {
          await fetchNotes()
          setIsEditing(false)
          setSelectedNote(null)
          setTitle('')
          setContent('')
          setCategoryId(null)
          setTags([])
        }
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      })
      if (response.ok) {
        await fetchNotes()
        if (selectedNote?.id === id) {
          setSelectedNote(null)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ name: newCategoryName, color: '#3b82f6' }),
      })
      if (response.ok) {
        await fetchCategories()
        setNewCategoryName('')
        setShowNewCategory(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setIsEditing(false)
    setSelectedNote(null)
    setTitle('')
    setContent('')
    setCategoryId(null)
    setTags([])
  }

  const handleSelectNote = (note: Note) => {
    if (!isCreating && !isEditing) {
      setSelectedNote(note)
    }
  }

  if (!token) {
    return <AuthForm onLoginSuccess={setToken} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Notes</h1>
            <p className="text-muted-foreground">Manage your notes efficiently</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Notes List and Categories */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Categories</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {showNewCategory && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button size="sm" onClick={handleCreateCategory}>
                      Add
                    </Button>
                  </div>
                )}
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-2 rounded border border-gray-200 cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notes</CardTitle>
                  <Button
                    onClick={handleCreateNew}
                    disabled={isCreating || isEditing}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-muted-foreground p-4">Loading...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-center text-muted-foreground p-4">No notes found</p>
                  ) : (
                    <div className="space-y-1">
                      {notes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleSelectNote(note)}
                          className={`w-full text-left p-3 border-l-4 transition-colors ${
                            selectedNote?.id === note.id
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent hover:bg-muted'
                          }`}
                        >
                          <p className="font-medium text-sm truncate">{note.title}</p>
                          {note.tags.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {note.tags.join(', ')}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor/Viewer */}
          <div className="lg:col-span-2">
            {isCreating || isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isCreating ? 'Create New Note' : 'Edit Note'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={categoryId || ''}
                      onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter note content..."
                      className="w-full min-h-64"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={tags.join(', ')}
                      onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder="e.g. important, work, todo"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {isCreating ? 'Create' : 'Update'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedNote ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                      </p>
                      {selectedNote.tags.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {selectedNote.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNote(selectedNote)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedNote.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap break-words">
                    {selectedNote.content || 'No content'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-96">
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Select a note or create a new one
                  </p>
                  <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
