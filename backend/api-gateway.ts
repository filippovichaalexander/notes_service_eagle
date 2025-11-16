import { Service, Context } from 'moleculer'

interface ApiMeta {
  headers?: {
    authorization?: string
    [key: string]: unknown
  }
  userId?: number
  email?: string
}

type ApiContext<P = unknown> = Context<P, ApiMeta>

interface NoteCreateBody {
  title: string
  content?: string
  categoryId?: number
  tags?: string[]
}

type NoteUpdateBody = Partial<NoteCreateBody>

export default {
  name: 'api',
  settings: {
    rest: '/api',
  },

  middleware: {
    authenticate: async (ctx: ApiContext) => {
      const authHeader = ctx.meta.headers?.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized')
      }

      const token = authHeader.substring(7)
      const verified = await ctx.broker.call<
        { userId: number; email: string },
        { token: string }
      >('users.verify', { token })
      if (verified) {
        ctx.meta.userId = verified.userId
        ctx.meta.email = verified.email
      }
    },
  },

  actions: {
    'rest.notes.list': {
      rest: 'GET /notes',
      auth: 'required',
      handler(ctx: ApiContext<{ search?: string; categoryId?: number }>) {
        return ctx.call('notes.list', ctx.params)
      },
    },

    'rest.notes.get': {
      rest: 'GET /notes/:id',
      auth: 'required',
      params: {
        id: 'number',
      },
      handler(ctx: ApiContext<{ id: number }>) {
        return ctx.call('notes.get', { id: ctx.params.id })
      },
    },

    'rest.notes.create': {
      rest: 'POST /notes',
      auth: 'required',
      handler(ctx: ApiContext<NoteCreateBody>) {
        return ctx.call('notes.create', ctx.params)
      },
    },

    'rest.notes.update': {
      rest: 'PATCH /notes/:id',
      auth: 'required',
      params: {
        id: 'number',
      },
      handler(
        ctx: ApiContext<{
          id: number
          body: NoteUpdateBody
        }>
      ) {
        return ctx.call('notes.update', {
          id: ctx.params.id,
          ...ctx.params.body,
        })
      },
    },

    'rest.notes.delete': {
      rest: 'DELETE /notes/:id',
      auth: 'required',
      params: {
        id: 'number',
      },
      handler(ctx: ApiContext<{ id: number }>) {
        return ctx.call('notes.remove', { id: ctx.params.id })
      },
    },
  },
}
