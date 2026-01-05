import { api } from './axiosConfig'

const getAllUsers = async () => {
  const { data } = await api.get('/users')
  return data?.data || data
}

const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`)
  return data?.data || data
}

const createUser = async (payload) => {
  const { data } = await api.post('/users', payload)
  return data?.data || data
}

const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload)
  return data?.data || data
}

const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`)
  return data?.data || data
}

export { createUser, deleteUser, getAllUsers, getUserById, updateUser }
