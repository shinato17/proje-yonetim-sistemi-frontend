import React, { useEffect, useState } from 'react';
import YeniMesajModal from '../components/YeniMesajModal';
import { IoSendOutline } from 'react-icons/io5';
import { FaTrashAlt } from 'react-icons/fa';
import { getCurrentUser } from '../auth/useAuth';
import './MesajlarSayfasi.css';
import api from '../api/axiosConfig';

function MesajlarSayfasi() {
  const [modalAcik, setModalAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState([]);
  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [tumKisiler, setTumKisiler] = useState([]);
  const [mesaj, setMesaj] = useState('');
  const [sohbetler, setSohbetler] = useState([]);

  const currentUser = getCurrentUser();
  const kendiId = currentUser?.id;

  useEffect(() => {
    api.get('/kullanicilar').then(res => setTumKisiler(res.data));
    api.get('/mesajlar/sohbetler').then(res => setSohbetler(res.data));
  }, []);

  useEffect(() => {
    if (!seciliKullanici) return;
    api.get(`/mesajlar/sohbet?diger=${seciliKullanici.id}`)
      .then(res => setMesajlar(res.data))
      .catch(() => setMesajlar([]));
  }, [seciliKullanici]);

  const mesajGonder = () => {
    if (!mesaj.trim() || !seciliKullanici) return;

    api.post('/mesajlar/gonder', {
      aliciId: seciliKullanici.id,
      icerik: mesaj
    })
      .then(() => {
        const yeni = {
          gonderenId: kendiId,
          aliciId: seciliKullanici.id,
          icerik: mesaj,
          zaman: new Date().toLocaleTimeString()
        };
        setMesajlar(prev => [...prev, yeni]);
        setMesaj('');
      })
      .catch(err => {
        console.error("Mesaj gönderilemedi", err);
      });
  };

  const sohbetSil = () => {
    if (!seciliKullanici) return;
    if (!window.confirm('Bu sohbeti silmek istiyor musunuz? Bu işlem karşı tarafın da sohbetini silecektir.'))
      return;
    api.delete(`/mesajlar/sohbet-sil?digerKullaniciId=${seciliKullanici.id}`)
      .then(() => {
        setSeciliKullanici(null);
        setMesajlar([]);
        setSohbetler(prev => prev.filter(s => s.id !== seciliKullanici.id));
      });
  };

  return (
    <div className="mesaj-sayfa">
      <div className="mesaj-listesi">
        <h3>Mesajlarım</h3>
        {sohbetler.length === 0 && <p className="bos-yazi">Hiç mesaj yok</p>}
        <div className="kisi-listesi">
          {sohbetler.map(k => (
            <div
              key={k.id}
              className={`kisi-item ${seciliKullanici?.id === k.id ? 'secili' : ''}`}
              onClick={() => { setSeciliKullanici(k); }}
            >
              <span>{k.isim}</span>
              {seciliKullanici?.id === k.id &&
                <FaTrashAlt className="sil-ikon" onClick={sohbetSil} />
              }
            </div>
          ))}
        </div>
        <button onClick={() => setModalAcik(true)} className="yeni-mesaj-btn">
          Yeni mesaj gönder
        </button>
      </div>

      <div className="mesaj-govde">
        {seciliKullanici ? (
          <>
            <div className="sohbet-kutu">
              {mesajlar.map((m, i) => (
                <div key={i} className={`baloncuk ${m.gonderenId === kendiId ? 'ben' : 'diger'}`}>
                  {m.icerik}
                  <div className="zaman">{m.zaman || m.tarih}</div>
                </div>
              ))}
            </div>
            <div className="mesaj-gonder">
              <input
                type="text"
                value={mesaj}
                onChange={e => setMesaj(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && mesajGonder()}
                placeholder="Mesaj yaz..."
              />
              <button onClick={mesajGonder}><IoSendOutline size={20} /></button>
            </div>
          </>
        ) : (
          <p className="bos-yazi">Sohbet seçilmedi</p>
        )}
      </div>

      {modalAcik &&
        <YeniMesajModal kisiler={tumKisiler} setSeciliKullanici={k => { setSeciliKullanici(k); setModalAcik(false); }} kapat={() => setModalAcik(false)} />
      }
    </div>
  );
}

export default MesajlarSayfasi;
