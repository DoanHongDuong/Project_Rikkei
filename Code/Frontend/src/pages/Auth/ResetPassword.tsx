import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!token) return setStatus('Token không tồn tại.');
    if (password.length < 6) return setStatus('Mật khẩu phải có ít nhất 6 ký tự.');
    if (password !== confirm) return setStatus('Mật khẩu xác nhận không khớp.');

    try {
      const resp = await axios.post(`${apiBase}/api/auth/reset-password/${encodeURIComponent(token)}`, { password });
      setStatus(resp.data?.message || 'Đặt lại mật khẩu thành công.');
    } catch (err: any) {
      setStatus(err?.response?.data?.message || 'Lỗi khi đặt lại mật khẩu.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto'}}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mật khẩu mới</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 6 }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Xác nhận mật khẩu</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 6 }} />
        </div>
        <button type="submit" style={{ marginTop: 12 }}>Đặt lại mật khẩu</button>
      </form>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}
