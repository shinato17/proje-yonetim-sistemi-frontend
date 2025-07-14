import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CiMail, CiLock, CiLogin } from 'react-icons/ci';
import './LoginPage.css';

function LoginPage() {
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const navigate = useNavigate();
  const sifreRef = useRef(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        eposta,
        sifre,
      });

      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('kullaniciIsim', decoded.isim || '');

      navigate('/dashboard');
    } catch (err) {
      console.error('Giriş Hatası:', err.response?.data || err.message);
      alert('Giriş başarısız. Bilgileri kontrol edin.');
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else {
        handleLogin();
      }
    } else if (e.key === 'Escape') {
      setEposta('');
      setSifre('');
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Proje Yönetim Sistemi</h1>

      <div className="login-box">
        <h2>Giriş Yap</h2>

        <div className="input-wrapper">
          <CiMail size={20} color="#530C99" />
          <input
            type="email"
            placeholder="E-posta"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, sifreRef)}
          />
        </div>

        <div className="input-wrapper">
          <CiLock size={20} color="#530C99" />
          <input
            ref={sifreRef}
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>

        <button className="login-button" onClick={handleLogin}>
          <CiLogin size={20} style={{ marginRight: '6px' }} />
          Giriş Yap
        </button>
      </div>

      <footer className="footer-info">
        V1 - Kodlama ve tasarım Mehmet Hakan Kaya tarafından yapılmıştır.
      </footer>
    </div>
  );
}

export default LoginPage;
