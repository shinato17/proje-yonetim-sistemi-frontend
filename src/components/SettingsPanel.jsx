import React from 'react';
import { useTheme } from '../context/ThemeContext';

const SettingsPanel = ({ open, onClose }) => {
  const { theme, toggleTheme, primaryColor, changePrimaryColor } = useTheme();

  if (!open) return null;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Tema Ayarları</h2>
        <button onClick={onClose}>X</button>
      </div>

      <div className="settings-option">
        <label>
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          Karanlık Mod
        </label>
      </div>

      <div className="settings-option">
        <label>Renk Seç:</label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => changePrimaryColor(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
