import { useState } from 'react'
import axios from 'axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setIsError(false)

    try {
      const response = await axios.post(`${apiBase}/api/auth/forgot-password`, { email })
      setMessage(response.data?.message)
      setIsError(false)
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Gửi liên kết đặt lại mật khẩu thất bại.')
      setIsError(true)
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: '3rem auto', padding: '1.5rem'}}>
      <h2 style={{ marginBottom: '1rem' }}>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{padding: '0.75rem', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Gửi liên kết đặt lại
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.9rem',
            borderRadius: 4,
            backgroundColor: isError ? '#fee2e2' : '#ecfdf5',
            color: isError ? '#b91c1c' : '#164e63',
            border: isError ? '1px solid #fca5a5' : '1px solid #a7f3d0'
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}
