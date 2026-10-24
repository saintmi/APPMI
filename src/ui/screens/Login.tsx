import { useState } from 'react';
import { login } from '../../auth/auth.ts';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemuat(true);
    setGalat(null);
    try {
      await login(username, password);
      window.location.reload();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="page-card" style={{ maxWidth: 420, margin: '80px auto' }}>
      <div className="card">
        <div className="card__header">
          <div className="card__title">Login APPMI</div>
          <div className="card__subtitle">Masuk ke backend Neon (online).</div>
        </div>
        <div className="card__body">
          <form onSubmit={submit} className="form-grid">
            <label>
              Username
              <input className="field__control" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </label>
            <label>
              Password
              <input className="field__control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            {galat && <p className="muted" style={{ color: 'crimson' }}>{galat}</p>}
            <button className="btn btn--primary" type="submit" disabled={memuat}>
              {memuat ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
