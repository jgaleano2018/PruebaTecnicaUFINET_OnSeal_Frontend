import { formatUsd } from '@/shared/utils/formatCurrency';
import type { OfferService } from '../../domain/offer.types';

interface ServicesTableProps {
  services: OfferService[];
  total: number;
}

export function ServicesTable({ services, total }: ServicesTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Tipo</th>
          <th scope="col" className="num">Mbps</th>
          <th scope="col" className="num">Plazo</th>
          <th scope="col">Viable</th>
          <th scope="col" className="num">MRC</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id}>
            <td>{service.tipo}</td>
            <td className="num">{service.mbps.toLocaleString('es-CO')}</td>
            <td className="num">{service.plazoMeses} meses</td>
            <td>{service.viable ? 'Sí' : 'No'}</td>
            <td className="num">{formatUsd(service.mrc)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={4}>
            Total mensual
          </th>
          <td className="num" data-testid="mrc-total">
            <strong>{formatUsd(total)}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
