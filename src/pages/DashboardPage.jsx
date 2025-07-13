import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProjeListesi from './ProjeListesi';
import KullaniciListesi from './KullaniciListesi';
import RolListesi from './RolListesi';

function DashboardPage() {
  const [aktifSayfa, setAktifSayfa] = useState('');
  const [kullaniciIsim, setKullaniciIsim] = useState('');

  useEffect(() => {
    const isim = localStorage.getItem('kullaniciIsim');
    if (isim) setKullaniciIsim(isim);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1F1F1F' }}>
      <Sidebar aktifSayfa={aktifSayfa} setAktifSayfa={setAktifSayfa} />
      <div style={{
        flexGrow: 1,
        padding: '40px',
        color: '#C3C3C3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {aktifSayfa === 'projeler' && <ProjeListesi />}
        {aktifSayfa === 'kullanicilar' && <KullaniciListesi />}
        {aktifSayfa === 'roller' && <RolListesi />}
        {!aktifSayfa && (
          <h1 style={{ fontSize: '32px', textAlign: 'center' }}>
            Hoşgeldiniz <span style={{ fontWeight: 'bold' }}>{kullaniciIsim}</span>
          </h1>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
