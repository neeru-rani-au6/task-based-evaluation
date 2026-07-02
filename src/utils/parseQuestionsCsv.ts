export interface CsvQuestionRow {
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
  explanation?: string
  difficulty?: string
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) || []).length
  const semicolons = (line.match(/;/g) || []).length
  const commas = (line.match(/,/g) || []).length
  if (tabs >= semicolons && tabs >= commas && tabs > 0) return '\t'
  if (semicolons >= commas && semicolons > 0) return ';'
  return ','
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }

  result.push(current.trim())
  return result
}

export function resolveCorrectOption(
  answer: string,
  options: Pick<CsvQuestionRow, 'option1' | 'option2' | 'option3' | 'option4'>,
): string {
  const value = answer.trim()
  if (!value) return 'option1'

  const lower = value.toLowerCase()
  if (['option1', 'option2', 'option3', 'option4'].includes(lower)) return lower

  const optionEntries = [
    ['option1', options.option1],
    ['option2', options.option2],
    ['option3', options.option3],
    ['option4', options.option4],
  ] as const

  const textMatch = optionEntries.find(([, text]) => text.trim().toLowerCase() === lower)
  if (textMatch) return textMatch[0]

  if (lower === '1' || lower === 'a') return 'option1'
  if (lower === '2' || lower === 'b') return 'option2'
  if (lower === '3' || lower === 'c') return 'option3'
  if (lower === '4' || lower === 'd') return 'option4'

  return 'option1'
}

export function normalizeCorrectOption(value: string): string {
  return resolveCorrectOption(value, { option1: '', option2: '', option3: '', option4: '' })
}

const COLUMN_ALIASES: Record<string, keyof CsvQuestionRow> = {
  question: 'question',
  questiontext: 'question',
  option1: 'option1',
  optiona: 'option1',
  a: 'option1',
  option2: 'option2',
  optionb: 'option2',
  b: 'option2',
  option3: 'option3',
  optionc: 'option3',
  c: 'option3',
  option4: 'option4',
  optiond: 'option4',
  d: 'option4',
  correctoption: 'correct_option',
  correctanswer: 'correct_option',
  correct: 'correct_option',
  answer: 'correct_option',
  explanation: 'explanation',
  solution: 'explanation',
  difficulty: 'difficulty',
  level: 'difficulty',
}

const DEFAULT_COLUMNS: (keyof CsvQuestionRow)[] = [
  'question',
  'option1',
  'option2',
  'option3',
  'option4',
  'correct_option',
  'explanation',
  'difficulty',
]

function mapRow(headers: string[], cells: string[]): CsvQuestionRow {
  const row: CsvQuestionRow = {
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 'option1',
  }

  headers.forEach((header, idx) => {
    const key = COLUMN_ALIASES[normalizeHeader(header)]
    const cell = cells[idx] ?? ''
    if (!key) return
    if (key === 'correct_option') row.correct_option = cell
    else row[key] = cell
  })

  row.correct_option = resolveCorrectOption(row.correct_option, row)
  return row
}

export function parseQuestionsCsv(text: string): CsvQuestionRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const delimiter = detectDelimiter(lines[0])
  const firstCells = parseCsvLine(lines[0], delimiter)
  const normalizedHeaders = firstCells.map(normalizeHeader)
  const hasHeader = normalizedHeaders.some((cell) => COLUMN_ALIASES[cell])

  const rows: CsvQuestionRow[] = []

  for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter)
    if (cells.every((cell) => !cell)) continue

    const row = hasHeader
      ? mapRow(firstCells, cells)
      : (() => {
          const mapped: CsvQuestionRow = {
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correct_option: 'option1',
          }
          DEFAULT_COLUMNS.forEach((key, idx) => {
            const cell = cells[idx]
            if (cell === undefined || cell === '') return
            if (key === 'correct_option') mapped.correct_option = cell
            else mapped[key] = cell
          })
          mapped.correct_option = resolveCorrectOption(mapped.correct_option, mapped)
          return mapped
        })()

    if (row.question.trim()) rows.push(row)
  }

  return rows
}

export const CSV_TEMPLATE = `question,option1,option2,option3,option4,correct_option,explanation,difficulty
"What is 2+2?",4,3,5,6,option1,"Basic addition",easy`
