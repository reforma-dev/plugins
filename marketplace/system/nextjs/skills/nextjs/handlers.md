# Handlers

`'use server'` actions and `route.ts` are public. A layout or `proxy.ts` check does not cover a direct POST. First lines: the **installed auth skill**’s server helper. Missing user → stop. Do not add `@/lib/auth` unless that file exists.

## Server Action

```ts
'use server'

import { refresh } from 'next/cache'

export async function createItem(formData: FormData) {
  const userId = /* await the auth skill’s server helper */
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // persist owned by userId
  refresh()
}
```

`refresh()` only here — not in a route handler. Done when an unsigned call throws and a signed call writes, then `refresh()`.

## Route handler

```ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function DELETE() {
  const userId = /* await the auth skill’s server helper */
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowed = /* permission from that skill */
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
```

- **401** — no session
- **403** — session, missing permission
