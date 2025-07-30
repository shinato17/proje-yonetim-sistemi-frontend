import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axiosConfig';
import { MdCancelPresentation } from "react-icons/md";
import { GiConfirmed } from "react-icons/gi";
import './Modal.css';

function GuncelleModal({ proje, onKapat, onGuncelle }) {
  const [isim, setIsim] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [durumId, setDurumId] = useState('');
  const [durumlar, setDurumlar] = useState([]);

  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const selectRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    axios.get('/proje-durumlari')
      .then(res => {
        setDurumlar(res.data);

        if (proje) {
          setIsim(proje.isim || '');
          setAciklama(proje.aciklama || '');
          const aktifDurum = res.data.find(d => d.isim === proje.durum);
          setDurumId(aktifDurum?.id?.toString() || '');
        } else {
          setIsim('');
          setAciklama('');
          setDurumId(res.data[0]?.id?.toString() || '');
        }
      });

    const handleKey = (e) => {
      if (e.key === 'Escape') onKapat();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [proje, onKapat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const guncelProje = {
      ...proje,
      isim,
      aciklama,
      durum: { id: Number(durumId) }
    };

    try {
      const res = proje && proje.id
        ? await axios.put(`/projeler/${proje.id}`, guncelProje)
        : await axios.post('/projeler', guncelProje);

      onGuncelle(res.data);
      onKapat();
    } catch {
      alert("İşlem başarısız.");
    }
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
        <h3 className="modal-title">{proje ? "Projeyi Güncelle" : "Yeni Proje Ekle"}</h3>
        <form onSubmit={handleSubmit} className="modal-form" ref={formRef}>
          <div className="modal-form-row">
            <label>Proje Adı:</label>
            <input
              ref={inputRef}
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, textareaRef)}
              autoFocus
              required
            />
          </div>

          <div className="modal-form-row">
            <label>Açıklama:</label>
            <textarea
              ref={textareaRef}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, selectRef)}
            />
          </div>

          <div className="modal-form-row">
            <label>Durum Seç:</label>
            <select
              ref={selectRef}
              value={durumId}
              onChange={(e) => setDurumId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  formRef.current?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }
              }}
              required
            >
              {durumlar.map(d => (
                <option key={d.id} value={d.id}>{d.isim}</option>
              ))}
            </select>
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-iptal" onClick={onKapat}>
              <MdCancelPresentation size={20} color="var(--text-color)" />
            </button>
            <button type="submit" className="btn-onay">
              <GiConfirmed size={20} color="var(--text-color)" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GuncelleModal;
