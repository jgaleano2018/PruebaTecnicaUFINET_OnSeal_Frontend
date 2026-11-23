import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <Link to="/offers">Volver al listado</Link>
    </section>
  );
}
