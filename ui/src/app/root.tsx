import { Outlet } from 'react-router-dom';
import { DocumentTitle } from './document-title';

export const Root = () => (
  <>
    <DocumentTitle />
    <Outlet />
  </>
);
