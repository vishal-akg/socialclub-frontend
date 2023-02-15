import { createContext, useContext, useEffect, useState } from "react";
import { useSocket, useSocketEvent } from "socket.io-react-hook";
import { useAuth } from "./auth";

export const ProfileContext = createContext();

export default function ProfileProvider({ children }) {
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const { setUser } = useAuth();

  const { socket, error, connected } = useSocket(
    `${process.env.NEXT_PUBLIC_BASE_URL}/user`,
    {
      withCredentials: true,
    }
  );
  const { lastMessage, sendMessage } = useSocketEvent(socket, "user:updated");

  useEffect(() => {
    sendMessage();
  }, []);

  if (lastMessage) {
    if ("cover" in lastMessage.modifiedFields) {
      setCover(null);
    } else if ("avatar" in lastMessage.modifiedFields) {
      setAvatar(null);
    }
    setUser(lastMessage.user);
  }

  const value = { avatar, cover, setAvatar, setCover };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
