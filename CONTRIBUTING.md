# Contributing

Thanks for helping improve the AI-901 Study Hub! The most valuable contributions
are **high-quality, accurate practice questions** and UX improvements.

## Workflow

`main` is protected. All changes go through a pull request and merge
automatically once CI is green — there is no manual approval step for now.

```bash
git checkout -b feat/my-change
# ...make changes...
npm run lint && npm run typecheck && npm run validate:bank && npm test && npm run build
git commit -am "feat: my change"
git push -u origin feat/my-change
gh pr create --fill
```

## Local development

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
npm test         # run unit tests
npm run validate:bank   # check question-bank integrity + print stats
```

## Adding questions

Questions live in `src/data/questions/<exam>-<domain>.ts` as typed
`RawQuestion` objects. The build will fail if a question is malformed, and
`npm run validate:bank` enforces additional rules.

Guidelines (see also the PR template):

- **Stay at fundamentals level.** AI-901 and AI-900 are *fundamentals* exams.
  Even `hard` questions must only require knowledge in the official skills
  outline — difficulty should come from richer **scenarios** and closer
  **distractors**, not deeper or out-of-scope material.
- **Use real Azure / AI terminology.** Distractors should be genuine, plausible
  services or capabilities (e.g. confusing *Azure AI Vision* with *Azure AI
  Face*), never invented names.
- **Reference Microsoft Learn.** Set `refKey` to one of the verified links in
  `src/data/references.ts`. Add a new key there if needed.
- **One clear rationale.** `explanation` should say why the answer is correct
  (and ideally why the top distractor is wrong).
- **Do not copy real exam questions.** Everything must be original.

## Question types

- `single` — one correct answer (4 choices)
- `multi` — multiple correct answers ("select two/three…", scored strictly)
- `statements` — a Yes/No review series (2–4 statements)
