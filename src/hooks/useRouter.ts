import { useState, useEffect, useCallback } from 'react';

export type Route =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'ai-core'
  | 'projects'
  | 'crm'
  | 'lms'
  | 'kms'
  | 'document-intelligence'
  | 'engineering'
  | 'packaging'
  | 'admin'
  | 'settings'
  | 'profile'
  | '404'
  | '500'
  | 'offline';

export const useRouter = (defaultRoute: Route = 'dashboard') => {
  const [route, setRouteState] = useState<Route>(() => {
    const hash = window.location.hash.replace('#/', '') as Route;
    return hash || defaultRoute;
  });

  const navigate = useCallback((to: Route) => {
    window.location.hash = `#/${to}`;
    setRouteState(to);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as Route;
      if (hash) {
        setRouteState(hash);
      } else {
        setRouteState(defaultRoute);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultRoute]);

  return { route, navigate };
};
