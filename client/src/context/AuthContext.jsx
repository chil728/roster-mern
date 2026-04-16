import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [types, setTypes] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getUserData = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  const getUserTypes = useCallback(async () => {
    try {
      const { data } = await api.get("/types");
      if (data.success) {
        setTypes(data.types);
      }
    } catch (error) {
      setTypes([]);
      toast.error(error.message);
    }
  }, []);

  const getAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/auth/check");
      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
        await getUserTypes();
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setTypes([]);
      }
    } catch (error) {
      console.error(error);
      setIsLoggedIn(false);
      setUser(null);
      setTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [getUserData, getUserTypes]);

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const value = {
    BACKEND_URL,
    isLoggedIn, setIsLoggedIn,
    isLoading,
    user, setUser,
    types, setTypes,
    getUserData,
    getUserTypes
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
