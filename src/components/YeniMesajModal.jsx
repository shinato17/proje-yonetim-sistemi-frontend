import React from 'react';
import './YeniMesajModal.css';
import { MdCancelPresentation } from 'react-icons/md';

function YeniMesajModal({ kisiler, setSeciliKullanici, kapat }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Kullanıcı Seç</h2>
        <div className="modal-kisi-listesi">
          {kisiler.map((k, i) => (
            <div
              key={i}
              className="modal-kisi-item"
              onClick={() => { setSeciliKullanici(k); kapat(); }}
            >
              {k.isim}
            </div>
          ))}
        </div>
        <button className="modal-iptal" onClick={kapat}>
          <MdCancelPresentation size={20} /> İptal
        </button>
      </div>
    </div>
  );
}

export default YeniMesajModal;
