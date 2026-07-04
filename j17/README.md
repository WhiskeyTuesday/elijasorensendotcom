# espaste — j17-backed markdown pastebin

Routes live in `src/routes/paste/`. j17 client is `src/routes/paste/j17.js`.
Event-sourcing model (`espaste.spec.json`):

- **`paste`** aggregate — `was_created` `{md, expires_at}`, `was_deleted` (tombstone
  flag; event sourcing has no hard delete).
- **`index`** aggregate (fixed singleton id) — `entry_added` / `entry_removed` keep a
  list of `{id, created_at, expires_at}`, because j17 has no "list all aggregates"
  query. TTL is enforced lazily at read time (j17 can't auto-expire).

Paste ids are 9-char Crockford base32 to match j17 humane codes.

## One-time setup (you, in the j17 console)

1. Create the instance named **espaste** at https://console.j17.dev → base URL
   `https://espaste.j17.dev`.
2. Deploy `espaste.spec.json` to it (dashboard upload or Admin API).
3. Grab an instance API key.

## Vercel env vars

| var | value |
|-----|-------|
| `J17_BASE_URL` | `https://espaste.j17.dev` |
| `J17_API_KEY` | the espaste instance key |
| `PASTE_API_KEY` | a secret you pick — guards our own POST/GET-list/DELETE |

## Usage

```bash
# create (send a non-form Content-Type so SvelteKit's CSRF guard allows it)
curl -X POST https://elijasorensen.com/paste \
  -H "Authorization: Bearer $PASTE_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @notes.md
# -> https://elijasorensen.com/paste/6Y1XWJZ4Z

# with a TTL (seconds); not served past that time
curl -X POST 'https://elijasorensen.com/paste?ttl=3600' ... --data-binary @notes.md

# read (public, renders HTML)
curl https://elijasorensen.com/paste/6Y1XWJZ4Z

# list all (authed, JSON)
curl https://elijasorensen.com/paste -H "Authorization: Bearer $PASTE_API_KEY"

# delete now (authed)
curl -X DELETE https://elijasorensen.com/paste/6Y1XWJZ4Z -H "Authorization: Bearer $PASTE_API_KEY"
```

## Assumptions worth verifying against live j17

- j17 accepts a **client-supplied 9-char humane code** as the aggregate id. If it
  requires a checksum or server-generated codes, adjust `makeId()` in `j17.js`.
- Singleton/index via a **fixed v4-shaped id** works as a normal aggregate. If j17
  wants an explicitly declared singleton, add it to the spec.
- `append_unique` / `remove … where` Tick ops behave on a not-yet-existing array.
- The 413 payload ceiling is whatever j17 enforces — the endpoint passes it through,
  so posting a big file will just tell you the limit.
