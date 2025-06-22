import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('founder'); // Default to founder mode

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'founder' ? 'investor' : 'founder');
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);