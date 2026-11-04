"use client";


import { login as loginService, logout as logoutService } from "@/services/auth";
import { getUser , getToken} from "@/lib/session";


import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

useEffect(() => {
  let mounted = true;

  async function initialize() {
    const user = getUser();
    const token = getToken();

    if (mounted) {
      if (user && token) {
        setUser(user);
      } else {
        setUser(null);
      }

      setLoading(false);
    }
  }

  initialize();

  return () => {
    mounted = false;
  };
}, []);


async function checkAuth() {
  try {
    const user = getUser();
    const token = getToken();

    if (user && token) {
      setUser(user);
    } else {
      setUser(null);
    }
  } finally {
    setLoading(false);
  }
}

  // ---------------------------------------
  // Login
  // ---------------------------------------

async function login(email, password) {
  try {
    const user = await loginService(email, password);

    setUser(user);

    router.replace("/admin/ecommerce/products");

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}

  // ---------------------------------------
  // Logout
  // ---------------------------------------

async function logout() {
  logoutService();

  setUser(null);

  router.replace("/login");
}



  const value = useMemo(
    () => ({
      user,

      loading,

      login,

      logout,

      isAuthenticated: !!user && !!getToken(),
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}