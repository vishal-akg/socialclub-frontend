import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { _login, _logout, _register } from "../../apis/endpoints/auth";
import { _me } from "../../apis/endpoints/user";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await _me();
        if (res.status === 200) {
          setUser(res.data);
        }
      } catch (error) {
        console.log(error);
        const { statusCode, message } = error.response?.data;
        if (statusCode === 401) {
          router.replace("/auth");
        }
      }
    };
    console.log(router.pathname);
    if (router.pathname !== "/auth") {
      fetchMe();
    }
  }, [router.pathname]);

  const register = async (data) => {
    const res = await _register(data);
    if (res.status === 201) {
      router.replace("/");
    }
  };

  const login = async (data) => {
    const res = await _login(data);
    console.log(res);
    if (res.status === 201) {
      router.replace("/");
    }
  };

  const logout = async () => {
    const res = await _logout();
    if (res.status === 204) {
      router.replace("/auth");
    }
  };

  const value = { register, login, logout, user, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
