import React, { useEffect, useRef, useState } from 'react';
import axios from '../api/axiosConfig';
import './Modal.css';
import { MdCancelPresentation } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";

function ProjeCalisanlariModal({ proje, onKapat }) {
  const [calisanlar, setCalisanlar] = useState([]);
  const [tumKullanicilar, setTumKullanicilar] = useState([]);
  const [roller, setRoller] = useState([]);
  const [yeniKullaniciId, setYeniKullaniciId] = useState('');
  const [secilenKullanici, setSecilenKullanici] = useState(null);

  const epostaRef = useRef(null);
  const rolRef = useRef(null);
  const ekleBtnRef = useRef(null);

  useEffect(() => {
    if (proje) {
      fetchCalisanlar();
      axios.get('/kullanicilar').then(res => setTumKullanicilar(res.data));
      axios.get('/roller').then(res => setRoller(res.data));
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onKapat();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [proje, onKapat]);

  const fetchCalisanlar = async () => {
    const response = await axios.get(`/proje-kullanicilari/proje/${proje.id}`);
    setCalisanlar(response.data);
  };

  const handleKullaniciChange = (e) => {
    const selectedId = e.target.value;
    setYeniKullaniciId(selectedId);
    const k = tumKullanicilar.find(k => k.id === Number(selectedId));
    setSecilenKullanici(k || null);
    setTimeout(() => epostaRef.current?.focus(), 0);
  };

  const handleEkle = async () => {
    if (!yeniKullaniciId || !secilenKullanici) {
      alert("Lütfen bir kullanıcı seçin.");
      return;
    }

    const zatenAtanmis = calisanlar.some(item => item.kullanici.id === Number(yeniKullaniciId));
    if (zatenAtanmis) {
      alert("Bu projeye bu kullanıcı zaten atanmış.");
      return;
    }

    try {
      await axios.post('/proje-kullanicilari/ata', {
        projeId: proje.id,
        kullaniciId: Number(yeniKullaniciId),
        rolId: secilenKullanici.rol.id
      });
      setYeniKullaniciId('');
      setSecilenKullanici(null);
      fetchCalisanlar();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || "Kullanıcı atanamadı."));
    }
  };

  const handleSil = async (id) => {
    if (!window.confirm("Bu kişiyi projeden çıkarmak istediğinize emin misiniz?")) return;
    await axios.delete(`/proje-kullanicilari/${id}`);
    fetchCalisanlar();
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Proje Çalışanları</h3>
        <p><strong>Proje Adı:</strong> {proje.isim}</p>
        <p><strong>Açıklama:</strong> {proje.aciklama}</p>

        {calisanlar.length === 0 ? (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            Bu projeye hiçbir çalışan atanmamıştır.
          </p>
        ) : (
          <table border={1} cellPadding={8} style={{ width: '100%', borderColor: '#530C99' }}>
            <thead style={{ backgroundColor: '#530C99', color: '#1F1F1F' }}>
              <tr>
                <th>Çalışan Adı</th>
                <th>Rolü</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {calisanlar.map((item) => (
                <tr key={item.id}>
                  <td>{item.kullanici.isim}</td>
                  <td>{item.rol.isim}</td>
                  <td>
                    <button onClick={() => handleSil(item.id)} className="btn-iptal">
                      <MdCancelPresentation size={18} color="#C3C3C3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h4 style={{ marginTop: '2rem', color: '#530C99' }}>Yeni Çalışan Ata</h4>
        <div className="modal-form">
          <div className="modal-form-row">
            <label>Kullanıcı Seç:</label>
            <select
              value={yeniKullaniciId}
              onChange={handleKullaniciChange}
              onKeyDown={(e) => handleKeyDown(e, epostaRef)}
            >
              <option value="">Seçiniz</option>
              {tumKullanicilar.map(k => (
                <option key={k.id} value={k.id}>{k.isim}</option>
              ))}
            </select>
          </div>

          {secilenKullanici && (
            <>
              <div className="modal-form-row">
                <label>E-posta:</label>
                <input ref={epostaRef} value={secilenKullanici.eposta} readOnly onKeyDown={(e) => handleKeyDown(e, rolRef)} />
              </div>
              <div className="modal-form-row">
                <label>Rol:</label>
                <input ref={rolRef} value={secilenKullanici.rol?.isim} readOnly onKeyDown={(e) => handleKeyDown(e, ekleBtnRef)} />
              </div>
            </>
          )}

          <div className="modal-buttons">
            <button type="button" onClick={onKapat} className="btn-iptal">
              <MdCancelPresentation size={20} color="#C3C3C3" />
            </button>
            <button ref={ekleBtnRef} onClick={handleEkle} className="btn-onay">
              <GiConfirmed size={20} color="#C3C3C3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjeCalisanlariModal;
