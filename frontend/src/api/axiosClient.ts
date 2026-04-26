import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'https://aura-jewellery-api.onrender.com'}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    const detail = data?.detail
    const message: string =
      data?.message ??
      (typeof detail === 'string' ? detail : detail?.message) ??
      error.message ??
      'Unknown error'
    const status: number = error.response?.status ?? 0
    return Promise.reject({ message, status, data })
  }
)

export default axiosClient
