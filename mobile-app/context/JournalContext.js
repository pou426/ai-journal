import React, { createContext, useState, useContext } from 'react';

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const triggerRefresh = () => {
    setLastUpdate(Date.now());
  };

  return (
    <JournalContext.Provider value={{ lastUpdate, triggerRefresh }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
} 