import { Card, CardContent } from '../ui/card';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';
import type { LoadDto } from '../../store/services/hauliusApi';
import { colors } from '../../styles/colors';

interface Props {
  loads: LoadDto[];
  openLoads: LoadDto[];
  assignedLoads: LoadDto[];
}

const COMPLETED_STATUSES = ['DELIVERED', 'PAID', 'COMPLETED'];

export function DashboardStats({ loads, openLoads, assignedLoads }: Props) {
  const inProgressLoads = loads.filter(
    l => l.assignedCarrierId && !COMPLETED_STATUSES.includes(l.status ?? '') && l.status !== 'OPEN',
  );
  const completedLoads = loads.filter(l => COMPLETED_STATUSES.includes(l.status ?? ''));

  const stats = [
    { label: 'Total Loads', value: loads.length, icon: Package },
    { label: 'Open', value: openLoads.length, icon: Clock },
    { label: 'In Progress', value: inProgressLoads.length, icon: Truck },
    { label: 'Completed', value: completedLoads.length, icon: CheckCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-0.5">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${colors.accentText}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
