import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { statesData } from '../data';

const Auth = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    state: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, state } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      let res;
      if (isLogin) {
        // For login, backend expects 'identifier' and 'password'
        res = await axios.post('/api/auth/login', { identifier: username, password }, config);
        setAuth(res.data.user);
        navigate('/dashboard');
      } else {
        // For registration
        if (!state) {
          setError('Please select a state');
          setLoading(false);
          return;
        }
        res = await axios.post('/api/auth/register', formData, config);
        setSuccess('Registration successful! Please sign in.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' })); // clear password
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`glass-panel auth-box ${isLogin ? 'login-shape' : 'register-shape'}`} data-page={isLogin ? 'login' : 'register'}>
        <div className="auth-header">
          <h1>India States Explorer</h1>
          <p>{isLogin ? 'Sign in to explore your state' : 'Register to get started'}</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">{isLogin ? 'Username or Email' : 'Username'}</label>
            <input
              type={isLogin ? 'text' : 'text'}
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
              placeholder={isLogin ? 'Enter username or email' : 'Choose a unique username'}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="state">Select Your State</label>
              <select name="state" id="state" value={state} onChange={onChange} required>
                <option value="">-- Select a State --</option>
                {statesData.map((s, index) => (
                  <option key={index} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {success && <div className="success-text mb-4 text-center" style={{ color: 'var(--success)', fontSize: '0.875rem' }}>{success}</div>}
          {error && <div className="error-text mb-4 text-center">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}>
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
