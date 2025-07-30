import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axiosConfig';
import { IoMdAdd } from 'react-icons/io';
import { IoTrashBinOutline, IoPencil } from 'react-icons/io5';
import { MdCancelPresentation } from 'react-icons/md';
import { GiConfirmed } from 'react-icons/gi';

function RolListesi() {
  const [roller, setRoller] = useState([]);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [yeniRol, setYeniRol] = useState({ isim: '' });
  const [siralaAZ, setSiralaAZ] = useState(true);

  const formRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchRoller();
    const escListener = (e) => {
      if (e.key === 'Escape') {
        setModalAcik(false);
        setDuzenlenen(null);
      }
    };
    window.addEventListener('keydown', escListener);
    return () => window.removeEventListener('keydown', escListener);
  }, []);

  const fetchRoller = async () => {
    try {
      const res = await axios.get('/roller');
      siraliYukle(res.data);
    } catch {
      alert("Roller yüklenemedi.");
    }
  };

  const siraliYukle = (data) => {
    const yonetici = data.find(r => r.isim === "Yönetici");
    const calisan = data.find(r => r.isim === "Çalışan");
    const digerler = data
      .filter(r => r.isim !== "Yönetici" && r.isim !== "Çalışan")
      .sort((a, b) =>
        siralaAZ ? a.isim.localeCompare(b.isim) : b.isim.localeCompare(a.isim)
      );
    setRoller([yonetici, calisan, ...digerler].filter(Boolean));
  };

  const toggleSirala = () => {
    setSiralaAZ(!siralaAZ);
    siraliYukle([...roller]);
  };

  const getSortSymbol = () => siralaAZ ? '▼' : '▲';

  const rolSil = async (id, isim) => {
    if (isim === "Yönetici" || isim === "Çalışan") {
      alert("Bu rol silinemez.");
      return;
    }
    if (!window.confirm("Bu rolü silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/roller/${id}`);
      fetchRoller();
    } catch (err) {
      const mesaj = err.response?.data?.message || err.response?.data || "Silme hatası.";
      alert(mesaj.replace(/400 BAD_REQUEST|\[|\]|"/g, '').trim());
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const girilenIsim = isEdit ? duzenlenen.isim.trim() : yeniRol.isim.trim();
    if (!girilenIsim) {
      alert("Rol adı boş olamaz.");
      return;
    }

    const ayniRol = roller.find(r => r.isim.toLowerCase() === girilenIsim.toLowerCase());
    if (ayniRol && (!isEdit || duzenlenen.id !== ayniRol.id)) {
      alert("Bu isimde bir rol zaten mevcut.");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`/roller/${duzenlenen.id}`, { isim: girilenIsim });
        setDuzenlenen(null);
      } else {
        await axios.post('/roller', { isim: girilenIsim });
        setYeniRol({ isim: '' });
        setModalAcik(false);
      }
      fetchRoller();
    } catch (err) {
      const msg = err.response?.data?.message || "İşlem sırasında hata oluştu";
      alert(msg);
    }
  };

  const renderModal = (isEdit = false) => {
    const data = isEdit ? duzenlenen : yeniRol;
    const setData = isEdit ? setDuzenlenen : setYeniRol;
    const close = () => isEdit ? setDuzenlenen(null) : setModalAcik(false);

    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'var(--background-color)',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid var(--primary-color)',
          color: 'var(--text-color)',
          width: '360px',
          maxWidth: '90vw'
        }}>
          <h3 style={{
            color: 'var(--primary-color)',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {isEdit ? "Rolü Güncelle" : "Yeni Rol Ekle"}
          </h3>
          <form ref={formRef} onSubmit={(e) => handleSubmit(e, isEdit)} style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--primary-color)',
              fontWeight: 'bold'
            }}>
              Rol Adı:
            </label>
            <input
              ref={inputRef}
              value={data.isim}
              onChange={(e) => setData(prev => ({ ...prev, isim: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setTimeout(() => {
                    formRef.current?.requestSubmit(); 
                  }, 100); 
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--primary-color)',
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-color)',
                boxSizing: 'border-box'
              }}
              required
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                type="button"
                onClick={close}
                style={{
                  backgroundColor: '#880015', // Kırmızı değil, eski tonunda
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px'
                }}
              >
                <MdCancelPresentation size={24} color="var(--text-color)" />
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px'
                }}
              >
                <GiConfirmed size={24} color="var(--text-color)" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      paddingLeft: '8px',
      paddingRight: '8px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 80px)',
      width: '100%',
      boxSizing: 'border-box',
      color: 'var(--text-color)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-color)' }}>Roller</h2>
        <button
          onClick={() => setModalAcik(true)}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-color)',
            border: 'none',
            padding: '6px 20px',
            height: '36px',
            fontSize: '15px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <IoMdAdd size={18} /> Yeni Rol
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{
          backgroundColor: 'var(--primary-color)',
          color: 'var(--background-color)'
        }}>
          <tr>
            <th style={{ padding: '10px', cursor: 'pointer' }} onClick={toggleSirala}>
              Rol Adı {getSortSymbol()}
            </th>
            <th style={{ padding: '10px' }}>Düzenle</th>
            <th style={{ padding: '10px' }}>Sil</th>
          </tr>
        </thead>
        <tbody>
          {roller.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--primary-color)' }}>
              <td style={{ padding: '10px' }}>{r.isim}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {(r.isim === "Yönetici" || r.isim === "Çalışan") ? (
                  <i style={{ color: '#777' }}>—</i>
                ) : (
                  <button
                    onClick={() => setDuzenlenen({ ...r })}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary-color)'
                    }}
                  >
                    <IoPencil size={20} />
                  </button>
                )}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {(r.isim === "Yönetici" || r.isim === "Çalışan") ? (
                  <i style={{ color: '#777' }}>—</i>
                ) : (
                  <button
                    onClick={() => rolSil(r.id, r.isim)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary-color)'
                    }}
                  >
                    <IoTrashBinOutline size={20} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAcik && renderModal(false)}
      {duzenlenen && renderModal(true)}
    </div>
  );
}

export default RolListesi;
