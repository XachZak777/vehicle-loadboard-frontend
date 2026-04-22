import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Eye, FileText, Truck, Building2 } from 'lucide-react';
import type { AdminUserDto } from '../../store/services/hauliusApi';

function ApprovalBadge({ approved, declined }: { approved: boolean; declined: boolean }) {
  if (approved)
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>;
  if (declined)
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  return role === 'CARRIER'
    ? <Badge variant="outline" className="text-blue-600 border-blue-300"><Truck className="size-3 mr-1" />Carrier</Badge>
    : <Badge variant="outline" className="text-purple-600 border-purple-300"><Building2 className="size-3 mr-1" />Broker</Badge>;
}

interface Props {
  user: AdminUserDto;
  onView: (u: AdminUserDto) => void;
}

export function UserRow({ user, onView }: Props) {
  return (
    <tr className="border-b border-border hover:bg-muted/40 transition-colors">
      <td className="py-3 px-4 text-sm font-medium">{user.email}</td>
      <td className="py-3 px-4"><RoleBadge role={user.role} /></td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{user.companyName || '—'}</td>
      <td className="py-3 px-4"><ApprovalBadge approved={user.adminApproved} declined={user.declined} /></td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {user.documents.length > 0
          ? <span className="flex items-center gap-1"><FileText className="size-3" />{user.documents.length}</span>
          : <span className="text-xs">none</span>
        }
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
      </td>
      <td className="py-3 px-4">
        <Button size="sm" variant="ghost" onClick={() => onView(user)}>
          <Eye className="size-4 mr-1" /> Review
        </Button>
      </td>
    </tr>
  );
}
