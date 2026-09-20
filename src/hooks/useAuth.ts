"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "@/types";
import {
  onAuthStateChange,
  signInUser,
  signUpUser,
  signInWithGoogle,
  signOutUser,
  resetPassword,
} from "@/lib/firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(({ isAuthenticated, user, profile }) => {
      setUser(user);
      setProfile(profile);
      setIsAuthenticated(isAuthenticated);
      setLoading(false);

      if (isAuthenticated && profile) {
        localStorage.setItem("ostaad_user_profile", JSON.stringify(profile));
      } else {
        localStorage.removeItem("ostaad_user_profile");
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    return await signInUser(email, pass);
  };

  const signup = async (name: string, email: string, pass: string, role?: string, phone?: string, pincode?: string) => {
    return await signUpUser(name, email, pass, role, phone, pincode);
  };

  const loginWithGoogle = async (role?: string) => {
    return await signInWithGoogle(role);
  };

  const logout = async () => {
    localStorage.removeItem("ostaad_user_profile");
    return await signOutUser();
  };

  const resetUserPassword = async (email: string) => {
    return await resetPassword(email);
  };

  return {
    user,
    profile,
    isAuthenticated,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetUserPassword,
  };
}
