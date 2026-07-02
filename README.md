# PrepRoute — Test Management App

A React app for creating tests, adding questions, and publishing them.

**Flow:** Login → Dashboard → Create/Edit Test → Add Questions → Preview & Publish

## Tech stack

- React 19 + TypeScript + Vite
- Material UI (MUI)
- Redux Toolkit (in-memory cache + background API refresh)
- React Router, React Hook Form, Axios

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # preview build locally
npm run deploy   # deploy to GitHub Pages
```

## API & auth

Development proxies `/api` to the staging backend (`vite.config.ts`).

- Login: `POST /auth/login` with `userId` and `password`
- JWT is stored in `localStorage` (`token`, `user`)
- All other requests send `Authorization: Bearer <token>`
- On `401`, the user is redirected to login

**Test credentials**

| Field    | Value          |
|----------|----------------|
| User ID  | `vedant-admin` |
| Password | `vedant123`    |

## Routes

| Route | Page |
|-------|------|
| `/login` | Login |
| `/dashboard` | Test list |
| `/tests/create` | Create test |
| `/tests/:id/edit` | Edit test |
| `/tests/:id/questions` | Add questions |
| `/tests/:id/preview` | Preview & publish |

---

## How it works

### 1. Login

- Form with **User ID** and **Password** (both required)
- On success: token saved, redirect to dashboard
- On failure: error message shown on the form

### 2. Dashboard

Loads all tests from `GET /tests`.

- Table shows: name, subject, type, status, created date, marks/questions count
- **Search** by name or subject
- **Filter** by status (all / draft / live) and type (chapterwise / PYQ / mock)
- **Pagination** (5, 10, or 25 rows per page)
- **Create New Test** → `/tests/create`

**Row actions**

| Button | What it does |
|--------|----------------|
| Edit | Opens edit test form |
| Quiz | Opens add questions page |
| Delete | Sets test status to `unpublished` (with confirm dialog) |

**Caching:** Tests are stored in Redux. Revisiting the dashboard shows cached data immediately while the API refreshes in the background (no full-page loader on return visits).

### 3. Create / Edit Test

Form fields:

- Test name (required)
- Subject — dropdown from `GET /subjects`
- Test type — Chapterwise, PYQ, or Mock Test
- Topics — multi-select from `GET /topics/subject/:subjectId`
- Sub-topics — multi-select from `POST /sub-topics/multi-topics`
- Difficulty — Easy / Medium / Difficult
- Marking scheme — wrong, unattempted, correct marks
- Duration (minutes), number of questions, total marks (auto-calculated)

**How save works**

- **Next** → `POST /tests` (create) or `PUT /tests/:id` (edit) with `status: draft` → navigates to Add Questions
- Edit mode loads test from Redux cache first, then refreshes from `GET /tests/:id`

### 4. Add Questions

Shows a **test summary card** at the top. Left **sidebar** lists question slots (green check = complete).

**Per question**

- Rich text question (bold, italic, underline, lists, link, image via modal/upload)
- Four MCQ options with radio for correct answer
- Optional explanation, difficulty, topic, sub-topic

**Navigation**

- **Next** — moves to the next question slot
- Last question **Next** → saves and opens preview
- **Publish** (top) — saves all complete questions and opens preview
- **Exit Test Creation** — returns to dashboard (test draft is kept; unsaved question edits in the browser are not sent to the API)

**Saving questions**

- Complete questions are sent to `POST /questions/bulk` with `test_id` and subject
- Existing questions are loaded via `POST /questions/fetchBulk` when opening the page
- Errors stay visible in a sticky alert until the user acts again

**CSV import**

Upload a `.csv` file to fill question slots. Example:

```csv
question,option1,option2,option3,option4,correct_option,explanation,difficulty
"What is 2+2?",4,3,5,6,4,"Basic addition",easy
```

Supports flexible column names, tab/semicolon delimiters, and correct answer as `option1`–`option4`, `1`–`4`, `A`–`D`, or matching option text.

### 5. Preview & Publish

Loads test from cache/API and questions via `fetchBulk`.

- Test summary card with **Edit** → edit test page
- **Publish Now** or **Schedule Publish** (date + time)
- **Live Until** — always, 1–4 weeks, 1 month, or custom end date/time
- **Confirm** → `PUT /tests/:id` with `status: live` (and schedule/expiry when set)
- Success screen, then redirect to dashboard after 2 seconds
- Publish is enabled when all configured questions are saved

---

## Redux store

| Slice | Purpose |
|-------|---------|
| `auth` | User and token (synced to `localStorage`) |
| `tests` | Test list + per-id cache; `fetchTests`, `fetchTestById` |
| `testFlow` | Current test during the create/edit flow |

`AppLayout` prefetches tests after login. Logout clears the test cache.

## Project structure

```
src/
├── api/              # Axios client & API functions
├── assets/           # logo, auth image, favicon, icons
├── components/
│   ├── layout/       # Navbar, drawer, protected routes
│   ├── login/
│   ├── questions/    # Sidebar, summary card, rich text editor
│   └── ui/           # Logo, breadcrumb, status badge
├── pages/            # Dashboard, CreateTest, AddQuestions, PreviewPublish
├── store/            # Redux store, slices, hooks
├── utils/            # API error parsing, CSV parser
└── theme.ts
```
