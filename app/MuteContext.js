import { createContext, useState, useContext } from "react";

export const MuteContext = createContext();

export const MuteProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    setIsMuted((prevMuted) => !prevMuted);
  };

  return (
    <MuteContext.Provider value={{ isMuted, handleMuteToggle }}>
      {children}
    </MuteContext.Provider>
  );
};

export const useMute = () => useContext(MuteContext);
