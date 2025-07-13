import React from 'react';
import { CiBoxList, CiLogout, CiUser } from 'react-icons/ci';
import { FiUsers } from 'react-icons/fi';
import { LiaAddressCard } from 'react-icons/lia';
import './Sidebar.css';
import { getCurrentUser } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

function Sidebar({ aktifSayfa, setAktifSayfa }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const roller = user?.authorities?.map(a => a.authority) || [];
  const isim = decodeURIComponent(localStorage.getItem('kullaniciIsim')) || '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2 className="sidebar-title">Proje Yönetim<br />Sistemi</h2>

        <div className="sidebar-user">
          <CiUser size={30} color="#1F1F1F" />
          <span style={{ color: '#1F1F1F', fontWeight: 'bold' }}>{isim}</span>
        </div>

        <button className={aktifSayfa === 'projeler' ? 'active' : ''} onClick={() => setAktifSayfa('projeler')}>
          <CiBoxList size={20} />
          Projeler
        </button>

        {roller.includes('Yönetici') && (
          <>
            <button className={aktifSayfa === 'kullanicilar' ? 'active' : ''} onClick={() => setAktifSayfa('kullanicilar')}>
              <FiUsers size={20} />
              Kullanıcılar
            </button>

            <button className={aktifSayfa === 'roller' ? 'active' : ''} onClick={() => setAktifSayfa('roller')}>
              <LiaAddressCard size={20} />
              Roller
            </button>
          </>
        )}
      </div>

      <button className="logout" onClick={handleLogout}>
        <CiLogout size={20} />
        Çıkış Yap
      </button>
    </div>
  );
}

export default Sidebar;
