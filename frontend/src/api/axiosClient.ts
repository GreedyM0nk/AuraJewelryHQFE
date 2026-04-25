import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`,
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
    const message: string =
      error.response?.data?.message ?? error.message ?? 'Unknown error'
    const status: number = error.response?.status ?? 0
    return Promise.reject({ message, status })
  }
)

export default axiosClient
