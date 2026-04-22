import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import type { AdminUserDto } from '../../store/services/hauliusApi';

interface Props {
  user: AdminUserDto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({ user, onConfirm, onCancel, isDeleting }: Props) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Registration</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{user.email}</strong> and all their data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting
              ? <Loader2 className="size-4 mr-1 animate-spin" />
              : <Trash2 className="size-4 mr-1" />
            }
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
