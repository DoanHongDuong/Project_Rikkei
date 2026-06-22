import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <p>
        <Link to="/auth/forgot">Quên mật khẩu</Link>
      </p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
