import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState(() => {
    const kayitliTema = localStorage.getItem('tema');
    return kayitliTema
      ? JSON.parse(kayitliTema)
      : {
          mode: 'dark',
          primaryColor: '#530C99'
        };
  });

  useEffect(() => {
    localStorage.setItem('tema', JSON.stringify(tema));
    document.documentElement.setAttribute('data-theme', tema.mode);
    document.documentElement.style.setProperty('--primary-color', tema.primaryColor);
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
