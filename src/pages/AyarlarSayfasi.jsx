import React from 'react';
import { useTheme } from '../context/ThemeContext';

const renkler = [
  '#530C99', '#0E4C92', '#E63946', '#1D3557', '#2A9D8F',
  '#F4A261', '#3b3b3b', '#8D99AE', '#F77F00', '#22493f'
];

function AyarlarSayfasi() {
  const { tema, setTema } = useTheme();

  const handleColorChange = (color) => {
    setTema(prev => ({ ...prev, primaryColor: color }));
  };

  const handleModeChange = (mode) => {
    setTema(prev => ({ ...prev, mode }));
  };

  return (
    <div style={{ padding: '20px', color: tema.mode === 'dark' ? '#fff' : '#111' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Ayarlar</h2>

      <div style={{ border: `2px solid ${tema.primaryColor}`, padding: '10px 20px', marginBottom: '30px' }}>
        <h3>Tema</h3>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <button
            style={{
              backgroundColor: '#1f1f1f',
              color: '#fff',
              padding: '8px 16px',
              border: tema.mode === 'dark' ? `2px solid ${tema.primaryColor}` : '1px solid #999'
            }}
            onClick={() => handleModeChange('dark')}
          >
            Karanlık
          </button>
          <button
            style={{
              backgroundColor: '#fff',
              color: '#111',
              padding: '8px 16px',
              border: tema.mode === 'light' ? `2px solid ${tema.primaryColor}` : '1px solid #999'
            }}
            onClick={() => handleModeChange('light')}
          >
            Aydınlık
          </button>
        </div>
      </div>

      <div style={{ border: `2px solid ${tema.primaryColor}`, padding: '10px 20px', marginBottom: '30px' }}>
        <h3>Renkler</h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '10px'
        }}>
          {renkler.map((renk, i) => (
            <div
              key={i}
              onClick={() => handleColorChange(renk)}
              style={{
                width: '60px',
                height: '30px',
                backgroundColor: renk,
                border: tema.primaryColor === renk ? '3px solid white' : '2px solid white',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ border: `2px solid ${tema.primaryColor}`, padding: '10px 20px' }}>
        <h3>Özel renk</h3>
        <input
          type="color"
          value={tema.primaryColor}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{
            marginTop: '10px',
            width: '100%',
            height: '40px',
            border: '2px solid white',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
}

export default AyarlarSayfasi;
