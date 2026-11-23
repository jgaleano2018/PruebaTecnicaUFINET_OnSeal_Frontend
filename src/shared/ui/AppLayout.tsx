import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/offers" className="layout__brand">
          Ufinet · Ofertas
        </Link>
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}
