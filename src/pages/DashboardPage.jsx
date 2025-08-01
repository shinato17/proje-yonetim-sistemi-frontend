import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProjeListesi from './ProjeListesi';
import KullaniciListesi from './KullaniciListesi';
import RolListesi from './RolListesi';
import AyarlarSayfasi from './AyarlarSayfasi';
import MesajlarSayfasi from './MesajlarSayfasi'; // Mesajlar sayfasını import ettik

function DashboardPage() {
  const [aktifSayfa, setAktifSayfa] = useState('');
  const [kullaniciIsim, setKullaniciIsim] = useState('');

  useEffect(() => {
    const isim = localStorage.getItem('kullaniciIsim');
    if (isim) setKullaniciIsim(isim);
  }, []);

  const renderSayfa = () => {
    switch (aktifSayfa) {
      case 'projeler':
        return <ProjeListesi />;
      case 'kullanicilar':
        return <KullaniciListesi />;
      case 'roller':
        return <RolListesi />;
      case 'ayarlar':
        return <AyarlarSayfasi />;
      case 'mesajlar':
        return <MesajlarSayfasi />;
      default:
        return (
          <h1 style={{ fontSize: '32px', textAlign: 'center', transition: 'color 0.4s ease' }}>
            Hoşgeldiniz <span style={{ fontWeight: 'bold' }}>{kullaniciIsim}</span>
          </h1>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--background-color)' }}>
      <Sidebar aktifSayfa={aktifSayfa} setAktifSayfa={setAktifSayfa} />
      <div
        style={{
          flexGrow: 1,
          padding: '40px',
          color: 'var(--text-color)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto', // mesajlar ve diğer içerik taşarsa scroll için
        }}
      >
        {renderSayfa()}
      </div>
    </div>
  );
}

export default DashboardPage;
