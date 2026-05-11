'use client';

import { useState, useEffect } from 'react';

export interface QFUser {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const [user, setUser] = useState<QFUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.isAuthenticated) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
      
    return () => { isMounted = false; };
  }, []);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return { user, isAuthenticated, isLoading, login, logout };
}
