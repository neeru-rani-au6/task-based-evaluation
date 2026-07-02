# PrepRoute — Test Management App

A React admin app for creating, editing, and publishing tests. Built to match the PrepRoute Figma flow: **Login → Dashboard → Create Test → Add Questions → Preview & Publish**.

## Tech stack

- React 19 + TypeScript + Vite
- Material UI (MUI)
- React Router, React Hook Form, Axios

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Build for production**

```bash
npm run build
npm run preview
```

## API

Staging backend is proxied in development via `vite.config.ts`:

- Dev: `/api` → `https://admin-moderator-backend-staging.up.railway.app/api`
- Auth: JWT stored in `localStorage` after login

**Test login**

| Field    | Value        |
|----------|--------------|
| User ID  | `vedant-admin` |
| Password | `vedant123`    |

## App flow

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Split-screen login |
| `/dashboard` | Dashboard | List, search, filter, paginate tests |
| `/tests/create` | Create Test | Test metadata form |
| `/tests/:id/edit` | Edit Test | Same form, pre-filled |
| `/tests/:id/questions` | Add Questions | Question editor + sidebar |
| `/tests/:id/preview` | Preview & Publish | Confirm & publish / schedule |

## Create Test

Required fields include **Subject**, **Topic**, **Sub Topic** (at least one each), marking scheme, and duration.

- **Chapterwise** / **Mock Test** tabs set test type
- **Total Marks** = No of Questions × Correct Answer (auto-calculated)

## Add Questions

- Left **Question creation** sidebar: navigate slots, green check = complete
- **Question Editor**: rich text toolbar (bold, italic, lists, link, image)
- Four MCQ options with radio for correct answer
- **Next** saves progress slot-by-slot; last question → **Save & Preview**
- **Publish** saves all complete questions and opens preview

### CSV import

Click **CSV** to bulk-fill questions. Supported headers (flexible naming):

```csv
question,option1,option2,option3,option4,correct_option,explanation,difficulty
"What is 2+2?",4,3,5,6,4,"Basic addition",easy
```

**Correct answer** can be:

- Option key: `option1` … `option4`
- Position: `1`–`4` or `A`–`D`
- **Option text**: e.g. `4` selects the option whose value is `4`

Also supports `Option 1`, `Option A`, tab/semicolon delimiters.

## Preview & Publish

- Test summary card + question sidebar
- **Publish Now** or **Schedule Publish** (date/time)
- **Live Until**: Always Available, 1–4 weeks, 1 month, or Custom Duration
- **Confirm** publishes the test (status → `live`)

## Project structure

```
src/
├── api/              # Axios client & endpoints
├── components/
│   ├── layout/       # App shell, sidebar, auth guard
│   ├── login/        # Login page
│   ├── questions/    # Sidebar, summary card, rich text editor
│   └── ui/           # Logo, breadcrumb, badges
├── context/          # Auth & test flow state
├── pages/            # Route pages
├── utils/            # API errors, CSV parser
└── theme.ts          # Brand colors & MUI theme
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |
