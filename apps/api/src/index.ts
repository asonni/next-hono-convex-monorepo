/// <reference types="bun-types" />
import { Hono } from 'hono'

const app = new Hono()

const welcomeStrings = [
  'Hello Hono!',
  'To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono'
]

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

if (import.meta.main) {
  Bun.serve({ fetch: app.fetch, port: 3001 })
  console.log('Server running at http://localhost:3001')
}

export default app
