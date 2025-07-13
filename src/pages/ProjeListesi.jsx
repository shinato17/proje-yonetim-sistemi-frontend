import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import GuncelleModal from '../components/GuncelleModal';
import ProjeCalisanlariModal from '../components/ProjeCalisanlariModal';
import { getCurrentUser } from '../auth/useAuth';
import { LuUsersRound } from "react-icons/lu";
import { IoTrashBinOutline, IoPencil } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

function ProjeListesi() {
  const [projeler, setProjeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [seciliProje, setSeciliProje] = useState(null);
  const [seciliProjeCalisanlari, setSeciliProjeCalisanlari] = useState(null);
  const [siralaKriter, setSiralaKriter] = useState('');
  const [siralaTers, setSiralaTers] = useState(false);
  const [ekleModaliAcik, setEkleModaliAcik] = useState(false);

  const user = getCurrentUser();
  const roller = user?.authorities?.map(a => a.authority) || [];
  const isYonetici = roller.includes("Yönetici");

  const projeleriGetir = async () => {
    setYukleniyor(true);
    try {
      const res = await axios.get('/projeler');
      setProjeler(res.data);
    } catch {
      setHata("Projeler yüklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    projeleriGetir();
  }, []);

  const handleSil = async (id) => {
    if (!window.confirm("Bu projeyi silmek istiyor musun?")) return;
    try {
      await axios.delete(`/projeler/${id}`);
      projeleriGetir();
    } catch {
      alert("Silme işlemi başarısız.");
    }
  };

  const handleGuncelle = (proje) => {
    setSeciliProje(proje);
  };

  const projeGuncelle = async (guncelProje) => {
    try {
      await axios.put(`/projeler/${guncelProje.id}`, guncelProje);
      setSeciliProje(null);
      projeleriGetir();
    } catch {
      alert("Güncelleme başarısız.");
    }
  };

  const toggleSirala = (kriter) => {
    if (siralaKriter === kriter) {
      setSiralaTers(!siralaTers);
    } else {
      setSiralaKriter(kriter);
      setSiralaTers(false);
    }
  };

  const getSortSymbol = (kriter) => {
    if (siralaKriter === kriter) return siralaTers ? '▼' : '▲';
    return '—';
  };

  const siraliProjeler = [...projeler].sort((a, b) => {
    let degerA = a[siralaKriter];
    let degerB = b[siralaKriter];

    if (siralaKriter === 'olusturmaTarihi') {
      degerA = new Date(degerA);
      degerB = new Date(degerB);
    } else {
      degerA = degerA?.toLowerCase() || '';
      degerB = degerB?.toLowerCase() || '';
    }

    if (degerA < degerB) return siralaTers ? 1 : -1;
    if (degerA > degerB) return siralaTers ? -1 : 1;
    return 0;
  });

  if (yukleniyor) return <p>Yükleniyor...</p>;
  if (hata) return <p style={{ color: 'red' }}>{hata}</p>;

  return (
    <div
      style={{
        paddingLeft: '8px',
        paddingRight: '8px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 80px)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ color: '#C3C3C3' }}>Projeler</h2>
        {isYonetici && (
          <button
            onClick={() => setEkleModaliAcik(true)}
            style={{
              backgroundColor: '#530C99',
              color: '#C3C3C3',
              border: 'none',
              padding: '6px 20px',
              height: '36px',
              fontSize: '15px',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IoMdAdd size={18} /> Proje Ekle
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#530C99', color: '#1F1F1F' }}>
          <tr>
            <th style={{ padding: '10px', cursor: 'pointer' }} onClick={() => toggleSirala('isim')}>
              Proje Adı {getSortSymbol('isim')}
            </th>
            <th style={{ padding: '10px', cursor: 'pointer' }} onClick={() => toggleSirala('aciklama')}>
              Açıklama {getSortSymbol('aciklama')}
            </th>
            <th style={{ padding: '10px', cursor: 'pointer' }} onClick={() => toggleSirala('durum')}>
              Durum {getSortSymbol('durum')}
            </th>
            <th style={{ padding: '10px', cursor: 'pointer' }} onClick={() => toggleSirala('olusturmaTarihi')}>
              Oluşturulma Tarihi {getSortSymbol('olusturmaTarihi')}
            </th>
            {isYonetici && <th style={{ padding: '10px' }}>Çalışanlar</th>}
            {isYonetici && <th style={{ padding: '10px' }}>Düzenle</th>}
            {isYonetici && <th style={{ padding: '10px' }}>Sil</th>}
          </tr>
        </thead>
        <tbody>
          {siraliProjeler.map((proje) => (
            <tr key={proje.id} style={{ borderBottom: '1px solid #530C99', color: '#C3C3C3' }}>
              <td style={{ padding: '10px' }}>{proje.isim}</td>
              <td style={{ padding: '10px' }}>{proje.aciklama}</td>
              <td style={{ padding: '10px' }}>{proje.durum}</td>
              <td style={{ padding: '10px' }}>{new Date(proje.olusturmaTarihi).toLocaleString()}</td>
              {isYonetici && (
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => setSeciliProjeCalisanlari(proje)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <LuUsersRound size={22} color="#530C99" />
                  </button>
                </td>
              )}
              {isYonetici && (
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => handleGuncelle(proje)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <IoPencil size={20} color="#530C99" />
                  </button>
                </td>
              )}
              {isYonetici && (
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => handleSil(proje.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <IoTrashBinOutline size={20} color="#530C99" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {ekleModaliAcik && isYonetici && (
        <GuncelleModal
          proje={null}
          onKapat={() => setEkleModaliAcik(false)}
          onGuncelle={() => {
            setEkleModaliAcik(false);
            projeleriGetir();
          }}
        />
      )}

      {seciliProje && isYonetici && (
        <GuncelleModal
          proje={seciliProje}
          onKapat={() => setSeciliProje(null)}
          onGuncelle={projeGuncelle}
        />
      )}

      {seciliProjeCalisanlari && isYonetici && (
        <ProjeCalisanlariModal
          proje={seciliProjeCalisanlari}
          onKapat={() => setSeciliProjeCalisanlari(null)}
        />
      )}
    </div>
  );
}

export default ProjeListesi;
