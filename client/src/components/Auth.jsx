import React, { useState, useEffect } from 'react';
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

  // ----------- Cinematic Background -----------
  // High‑resolution royalty‑free images (feel free to replace with your own)
  const bgImages = [
    'https://images.unsplash.com/photo-1534351590666-13e3e96cce09?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1529243856180-6f7c56d6da53?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=80'
  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((i) => (i + 1) % bgImages.length);
    }, 8000); // change every 8 seconds
    return () => clearInterval(timer);
  }, []);
  // -------------------------------------------

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
    <div className="auth-container min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden relative">
      {/* Cinematic rotating background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out"
        style={{
          backgroundImage: `url(${bgImages[bgIndex]})`,
          opacity: 0.45,
          filter: 'blur(12px) saturate(150%)'
        }}
      />

        {/* Overlay gradient for cinematic flair */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-amber-600/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-600/20 via-transparent to-transparent" />
        </div>

      {/* Decorative color glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30" />
      </div>

      <div className={`glass-panel auth-box ${isLogin ? 'login-shape' : 'register-shape'} relative flex flex-col justify-center p-12 md:p-24 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-amber-500/20 backdrop-blur-3xl animate-fade-in`} data-page={isLogin ? 'login' : 'register'}>
        <div className="auth-header mb-12 text-center relative z-10">
          <div className="h-px w-12 bg-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-serif font-black bg-gradient-to-b from-white via-white to-amber-500/30 bg-clip-text text-transparent drop-shadow-2xl mb-4 tracking-tighter">
            India Tourism
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.3em] text-[10px]">
            {isLogin ? 'Welcome back to the heritage' : 'Join the cultural journey'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative z-10 space-y-8">
          <div className="space-y-2">
            <label htmlFor="username" className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest ml-1">
              {isLogin ? 'Identity' : 'Username'}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-slate-600 shadow-inner"
              placeholder={isLogin ? 'Username or Email' : 'Choose a unique name'}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Electronic Mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-slate-600 shadow-inner"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Access Key</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-slate-600 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="state" className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Origin State</label>
              <div className="relative group">
                <select
                  name="state"
                  id="state"
                  value={state}
                  onChange={onChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950">Select Destination</option>
                  {statesData.map((s, index) => (
                    <option key={index} value={s.name} className="bg-slate-950">
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50 text-xs">▼</div>
              </div>
            </div>
          )}

          {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center animate-bounce">{success}</div>}
          {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center animate-shake">{error}</div>}

          <button
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(217,119,6,0.3)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.5)] transition-all duration-300 transform active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Entering...' : (isLogin ? 'Begin Journey' : 'Register Now')}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
            {isLogin ? "New to the explorer?" : "Member of the heritage?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="px-8 py-2 rounded-full border border-white/10 hover:border-amber-500/30 text-white hover:text-amber-500 transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
          >
            {isLogin ? 'Create Account' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
