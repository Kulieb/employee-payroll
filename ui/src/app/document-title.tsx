import { useEffect } from 'react';
import { useLocation, useMatches } from 'react-router-dom';
import { useCurrentUser } from '../core/hooks/auth/use-current-user';
import { homeTitle } from '../pages/home-title';

type RouteHandle = { title?: string };

export const DocumentTitle = () => {
  const location = useLocation();
  const { currentUser } = useCurrentUser();
  const matches = useMatches();
  const routeTitle = [...matches]
    .reverse()
    .map((match) => (match.handle as RouteHandle | undefined)?.title)
    .find(Boolean);
  const page =
    location.pathname === '/' ? homeTitle(currentUser?.role) : routeTitle;

  useEffect(() => {
    document.title = page ? `Interface | ${page}` : 'Interface';
  }, [page]);

  return null;
};
