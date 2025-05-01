"use client";

import { useEffect } from "react";
import { useAuth } from "../providers/auth-provider";

export function NavHelper() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle redirects after login
    const pendingRedirect = localStorage.getItem('pendingRedirect');
    if (pendingRedirect) {
      console.log("Found pending redirect flag, clearing it");
      localStorage.removeItem('pendingRedirect');
    }

    // If we have user data but no auth cookies, try to set them
    if (user && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const hasAuthStatus = cookies.some(cookie => cookie.trim().startsWith('auth_status='));
      
      if (!hasAuthStatus) {
        console.log("User is authenticated but auth_status cookie is missing, trying to restore");
        
        // Force a verification check with the /api/auth/me endpoint
        fetch("/api/auth/me", {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            console.log("Session verified successfully, reloading page");
            window.location.reload();
          }
        })
        .catch(err => {
          console.error("Error verifying session:", err);
        });
      }
    }
  }, [user]);

  return null;
} 