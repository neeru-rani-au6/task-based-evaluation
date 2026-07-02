import api from './client'
import type { ApiResponse, Question, Subject, SubTopic, Test, Topic, User } from '../types'

export const login = (userId: string, password: string) =>
  api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { userId, password })

export const getSubjects = () => api.get<ApiResponse<Subject[]>>('/subjects')

export const getTopicsBySubject = (subjectId: string) =>
  api.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`)

export const getSubTopicsByTopics = (topicIds: string[]) =>
  api.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', { topicIds })

export const getAllTests = () => api.get<ApiResponse<Test[]>>('/tests')

export const getTestById = (id: string) => api.get<ApiResponse<Test>>(`/tests/${id}`)

export const createTest = (data: Partial<Test>) =>
  api.post<ApiResponse<Test>>('/tests', data)

export const updateTest = (id: string, data: Partial<Test>) =>
  api.put<ApiResponse<Test>>(`/tests/${id}`, data)

export const bulkCreateQuestions = (questions: Question[]) =>
  api.post<ApiResponse<Question[]>>('/questions/bulk', { questions })

export const fetchBulkQuestions = (question_ids: string[]) =>
  api.post<ApiResponse<Question[]>>('/questions/fetchBulk', { question_ids })
