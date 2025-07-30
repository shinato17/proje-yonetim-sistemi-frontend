import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axiosConfig';
import { IoTrashBinOutline, IoPencil, IoEye, IoEyeOff } from 'react-icons/io5';
import { IoMdAdd } from 'react-icons/io';
import { MdCancelPresentation } from 'react-icons/md';
import { GiConfirmed } from 'react-icons/gi';
import { getCurrentUser } from '../auth/useAuth';

function KullaniciListesi() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [roller, setRoller] = useState([]);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [yeniKullanici, setYeniKullanici] = useState({ isim: '', eposta: '', sifre: '', rolId: '' });
  const [siralaKriter, setSiralaKriter] = useState('');
  const [siralaTers, setSiralaTers] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreGosterDuzenle, setSifreGosterDuzenle] = useState(false);
  
  const formRef = useRef(null);
  const isimRef = useRef(null);
  const epostaRef = useRef(null);
  const sifreRef = useRef(null);
  const rolRef = useRef(null);

  const currentUser = getCurrentUser();
  const userRoller = currentUser?.authorities?.map(a => a.authority) || [];
  const isYonetici = userRoller.includes("Yönetici");

  const handleInputChange = (e, setData, fieldName) => {
    const value = e.target.value;
    
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(value)) {
      alert(`${fieldName} alanında Türkçe karakter kullanmayınız!`);
      return;
    }
    
    setData(prev => ({ ...prev, [e.target.name]: value }));
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
    return siralaKriter === kriter ? (siralaTers ? '▼' : '▲') : '—';
  };

  const siraliKullanicilar = [...kullanicilar].sort((a, b) => {
    let degerA = siralaKriter === 'rol' ? (a.rol?.isim?.toLowerCase() || '') : (a[siralaKriter]?.toString().toLowerCase() || '');
    let degerB = siralaKriter === 'rol' ? (b.rol?.isim?.toLowerCase() || '') : (b[siralaKriter]?.toString().toLowerCase() || '');
    
    return degerA.localeCompare(degerB) * (siralaTers ? -1 : 1);
  });

  const fetchData = async () => {
    setYukleniyor(true);
    try {
      const [kullanicilarRes, rollerRes] = await Promise.all([
        axios.get('/kullanicilar'),
        axios.get('/roller')
      ]);
      setKullanicilar(kullanicilarRes.data);
      setRoller(rollerRes.data);
    } catch (error) {
      setHata("Veriler yüklenirken hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setModalAcik(false);
        setDuzenlenen(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleEnter = (e, nextAction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (nextAction === 'submit') {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true }));
      } else if (nextAction === 'focusRol') {
        rolRef.current?.focus();
      } else if (nextAction && typeof nextAction === 'function') {
        nextAction();
      }
    }
  };

  const handleKullaniciEkle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/kullanicilar', yeniKullanici);
      setModalAcik(false);
      setYeniKullanici({ isim: '', eposta: '', sifre: '', rolId: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Kullanıcı eklenirken hata oluştu");
    }
  };

  const handleKullaniciDuzenle = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/kullanicilar/${duzenlenen.id}`, duzenlenen);
      setDuzenlenen(null);
      fetchData();
    } catch (error) {
      alert("Düzenleme sırasında bir hata oluştu");
    }
  };

  const kullaniciSil = async (id, eposta) => {
    if (currentUser && currentUser.eposta && eposta && 
        currentUser.eposta.toLowerCase() === eposta.toLowerCase()) {
      alert("Bu hesapla giriş yaptınız. Bu hesabı silemezsiniz");
      return;
    }
    
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    
    try {
      await axios.delete(`/kullanicilar/${id}`);
      fetchData();
    } catch (error) {
      alert("Silme işlemi sırasında bir hata oluştu");
    }
  };

  const renderModal = (isEdit = false) => {
    const data = isEdit ? duzenlenen : yeniKullanici;
    const setData = isEdit ? setDuzenlenen : setYeniKullanici;
    const submitHandler = isEdit ? handleKullaniciDuzenle : handleKullaniciEkle;
    const showPassword = isEdit ? sifreGosterDuzenle : sifreGoster;
    const setShowPassword = isEdit ? setSifreGosterDuzenle : setSifreGoster;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.4)',
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
          width: '420px',
          maxWidth: '90vw'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: 'var(--primary-color)', 
            fontWeight: 'bold', 
            textAlign: 'center',
            paddingBottom: '10px'
          }}>
            {isEdit ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
          </h3>
          <form ref={formRef} onSubmit={submitHandler} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                İsim:
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'normal',
                  color: '#999',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Lütfen Türkçe karakter kullanmayın
                </span>
              </label>
              <input
                ref={isimRef}
                name="isim"
                value={data.isim}
                onChange={(e) => handleInputChange(e, setData, 'İsim')}
                required
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary-color)',
                  backgroundColor: 'var(--background-color)',
                  color: 'var(--text-color)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onKeyDown={(e) => handleEnter(e, () => epostaRef.current?.focus())}
              />
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                E-Posta:
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'normal',
                  color: '#999',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Örnek: example@domain.com
                </span>
              </label>
              <input
                ref={epostaRef}
                name="eposta"
                type="email"
                value={data.eposta}
                onChange={(e) => handleInputChange(e, setData, 'E-posta')}
                required
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary-color)',
                  backgroundColor: 'var(--background-color)',
                  color: 'var(--text-color)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onKeyDown={(e) => handleEnter(e, () => sifreRef.current?.focus())}
              />
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                Şifre:
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'normal',
                  color: '#999',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Lütfen Türkçe karakter kullanmayın
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={sifreRef}
                  name="sifre"
                  type={showPassword ? 'text' : 'password'}
                  value={data.sifre}
                  onChange={(e) => handleInputChange(e, setData, 'Şifre')}
                  required={!isEdit}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--primary-color)',
                    backgroundColor: 'var(--background-color)',
                    color: 'var(--text-color)',
                    width: '100%',
                    paddingRight: '40px',
                    boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => handleEnter(e, 'focusRol')}
                />
                <button 
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                Rol Seç:
              </label>
              <select
                ref={rolRef}
                name="rolId"
                value={data.rolId}
                onChange={(e) => setData(prev => ({ ...prev, rolId: e.target.value }))}
                required
                onKeyDown={(e) => {
                        if (e.key === 'Enter') {
    e.preventDefault();
    if (!formRef.current.submittedOnce) {
      formRef.current.submittedOnce = true;
      formRef.current?.requestSubmit();
    }
  }
}}
onBlur={() => {
  if (data.rolId && !formRef.current.submittedOnce) {
    formRef.current.submittedOnce = true;
    formRef.current?.requestSubmit();
  }
}}

                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary-color)',
                  backgroundColor: 'var(--background-color)',
                  color: 'var(--text-color)',
                  width: '100%',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23530C99' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="">Seçiniz</option>
                {roller.map(r => (
                  <option key={r.id} value={r.id}>{r.isim}</option>
                ))}
              </select>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '20px'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={isEdit ? () => setDuzenlenen(null) : () => setModalAcik(false)}
                  style={{
                    backgroundColor: '#880015',
                    color: 'var(--text-color)',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    transition: 'background-color 0.2s'
                  }}
                  title="İptal"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a0001a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#880015'}
                >
                  <MdCancelPresentation color="var(--text-color)" size={24} />
                </button>
                <button 
                  type="submit"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--text-color)',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    transition: 'background-color 0.2s'
                  }}
                  title={isEdit ? "Kaydet" : "Ekle"}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6a1cb3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
                >
                  <GiConfirmed color="var(--text-color)" size={24} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (yukleniyor) return <p>Yükleniyor...</p>;
  if (hata) return <p style={{ color: 'red' }}>{hata}</p>;

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
        <h2 style={{ color: 'var(--text-color)' }}>Kullanıcı Listesi</h2>
        {isYonetici && (
          <button
            onClick={() => setModalAcik(true)}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color)',
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
            <IoMdAdd size={18} /> Kullanıcı Ekle
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--primary-color)', color: 'var(--background-color)' }}>
          <tr>
            <th 
              style={{ padding: '10px', cursor: 'pointer' }} 
              onClick={() => toggleSirala('isim')}
            >
              İsim {getSortSymbol('isim')}
            </th>
            <th 
              style={{ padding: '10px', cursor: 'pointer' }} 
              onClick={() => toggleSirala('eposta')}
            >
              Eposta {getSortSymbol('eposta')}
            </th>
            <th 
              style={{ padding: '10px', cursor: 'pointer' }} 
              onClick={() => toggleSirala('rol')}
            >
              Rol {getSortSymbol('rol')}
            </th>
            <th style={{ padding: '10px' }}>Düzenle</th>
            <th style={{ padding: '10px' }}>Sil</th>
          </tr>
        </thead>
        <tbody>
          {siraliKullanicilar.map(k => (
            <tr key={k.id} style={{ borderBottom: '1px solid var(--primary-color)' }}>
              <td style={{ padding: '10px' }}>{k.isim}</td>
              <td style={{ padding: '10px' }}>{k.eposta}</td>
              <td style={{ padding: '10px' }}>{k.rol?.isim}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button 
                  onClick={() => setDuzenlenen({ ...k, rolId: k.rol?.id })} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--primary-color)'
                  }}
                >
                  <IoPencil size={20} />
                </button>
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button 
                  onClick={() => kullaniciSil(k.id, k.eposta)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--primary-color)'
                  }}
                >
                  <IoTrashBinOutline size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAcik && renderModal()}
      {duzenlenen && renderModal(true)}
    </div>
  );
}

export default KullaniciListesi;