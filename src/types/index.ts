export interface User {
  id: string
  userId: string
  name?: string
  role?: string
}

export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id: string
}

export interface Test {
  id: string
  name: string
  type?: string
  subject?: string
  topics?: string[]
  sub_topics?: string[]
  correct_marks?: number
  wrong_marks?: number
  unattempt_marks?: number
  difficulty?: string
  total_time?: number
  total_marks?: number
  total_questions?: number
  status?: string | null
  questions?: string[] | null
  created_at?: string
  scheduled_date?: string | null
  expiry_date?: string | null
}

export interface Question {
  id?: string
  type?: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
  explanation?: string
  difficulty?: string
  subject?: string
  topic?: string
  sub_topic?: string
  test_id?: string
}

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}
