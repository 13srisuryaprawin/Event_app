import { useState } from 'react';
import { ShieldCheck, Fingerprint, KeyRound, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import API from '../api/axios';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/login/', { username, password });
      onLogin(res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Access denied. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-royal">
        <div className="login-brand-section">
          <div className="brand-logo-hex">
            <ShieldCheck size={36} strokeWidth={1.5} />
          </div>
          <h2>Login</h2>
          <p>Secure authentication for the management system</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group-royal">
            <label htmlFor="username">Identity</label>
            <div className="input-with-icon">
              <Fingerprint size={20} className="field-icon" />
              <input
                id="username"
                type="text"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="input-group-royal">
            <label htmlFor="password">Passkey</label>
            <div className="input-with-icon">
              <KeyRound size={20} className="field-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinner-icon" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <Zap size={18} fill="currentColor" />
                <span>Secure Login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;