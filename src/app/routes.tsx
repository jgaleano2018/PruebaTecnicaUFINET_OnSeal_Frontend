import { Navigate, type RouteObject } from 'react-router-dom';
import { OfferCreatePage, OfferDetailPage, OfferListPage } from '@/features/offers';
import { AppLayout } from '@/shared/ui/AppLayout';
import { NotFoundPage } from '@/shared/ui/NotFoundPage';

/** Sin login: la aplicación abre directamente en el listado. */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/offers" replace /> },
      { path: 'offers', element: <OfferListPage /> },
      { path: 'offers/new', element: <OfferCreatePage /> },
      { path: 'offers/:id', element: <OfferDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
