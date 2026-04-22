import { Card, CardContent } from '../ui/card';
import { Package, Clock, Truck, DollarSign } from 'lucide-react';
import type { LoadDto } from '../../store/services/hauliusApi';

interface Props {
  loads: LoadDto[];
  openLoads: LoadDto[];
  assignedLoads: LoadDto[];
}

export function DashboardStats({ loads, openLoads, assignedLoads }: Props) {
  const stats = [
    { label: 'Total Loads',  value: loads.length,          icon: Package,    color: 'text-muted-foreground' },
    { label: 'Open Loads',   value: openLoads.length,       icon: Clock,      color: 'text-amber-500' },
    { label: 'Assigned',     value: assignedLoads.length,   icon: Truck,      color: 'text-blue-500' },
    { label: 'Open Bids',    value: openLoads.length,       icon: DollarSign, color: 'text-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
