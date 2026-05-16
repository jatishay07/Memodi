# Codebase Map

## Root

```
.
├── package.json          # Deploy + AWS SDK deps
├── serverless.yml        # Lambdas, DynamoDB, IAM
├── README.md             # Disclaimer + link to docs/
└── docs/                 # Full documentation suite
```

## `lambda/` — implemented

| Path | Status |
|------|--------|
| `shared/bedrock.js` | Done |
| `shared/dynamodb.js` | Done |
| `shared/polly.js` | Done |
| `shared/transcribe.js` | Done |
| `shared/auth.js` | **Not built** (post-hackathon) |
| Auth handlers (4) | Done |
| Core handlers (7) | Done |

## `web/` — partial

| Path | Status |
|------|--------|
| `lib/api.js` | Done — Bearer header, no hardcoded ID |
| `lib/auth.js` | Done |
| `lib/audio.js` | Done |
| `components/*` | Done (4 components) |
| `app/globals.css` | Done |
| `app/layout.js`, pages, `middleware.js` | **Not built** |

## Ownership

| Concern | Location |
|---------|----------|
| HTTP routes | `serverless.yml` |
| DB | `lambda/shared/dynamodb.js` |
| UI | `web/components/`, `web/app/` (pages TBD) |
| Session | `web/lib/auth.js` |

## v1 constraints (from decisions)

- Do not add JWT verify to Lambdas unless explicitly requested
- Do not add S3/Rekognition to serverless.yml
- Middleware must block patients from `/family`
- Register patient with `name` + `timezone` required in UI (align with docs; backend may still accept optional DOB)

## Related

- [implementation-checklist.md](implementation-checklist.md)
- [rebuild-from-scratch.md](rebuild-from-scratch.md)
