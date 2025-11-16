# Notes App - Moleculer Backend

Microservices architecture with separate services for notes and users management.

## Services

### Notes Service (`notes.service.ts`)
- `list` - Get all notes for user (with search and category filtering)
- `get` - Get specific note
- `create` - Create new note
- `update` - Update note
- `remove` - Delete note

### Users Service (`users.service.ts`)
- `register` - Register new user
- `login` - Login user
- `verify` - Verify JWT token

## Running

\`\`\`bash
npm install
npm run dev
\`\`\`

## Environment Variables

- `JWT_SECRET` - JWT signing secret
- `NATS_URL` - NATS transporter URL (optional, uses Fake by default)
- `NODE_ID` - Node identifier
