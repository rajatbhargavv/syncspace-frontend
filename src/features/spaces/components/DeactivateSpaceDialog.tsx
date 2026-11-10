import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Dialog, Input } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useDeactivateSpace } from '../hooks/useDeactivateSpace';
import type { Space } from '../types/space.types';

export interface DeactivateSpaceDialogProps {
  space: Space;
  isOpen: boolean;
  onClose: () => void;
}

export const DeactivateSpaceDialog: React.FC<DeactivateSpaceDialogProps> = ({
  space,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const deactivate = useDeactivateSpace();
  const [confirmation, setConfirmation] = useState('');
  const canDeactivate = confirmation === space.name;

  const handleClose = () => {
    setConfirmation('');
    onClose();
  };

  const handleDeactivate = async () => {
    try {
      await deactivate.mutateAsync(space._id);
      toast.success('Space deactivated');
      handleClose();
      navigate(ROUTES.spaces);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to deactivate space');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Deactivate this space?"
      description="This keeps the space in your records but prevents further activity."
    >
      <div className="space-y-5">
        <p className="text-sm text-text-muted">
          Type <strong className="text-text">{space.name}</strong> to confirm. This action cannot be
          undone.
        </p>
        <Input
          label="Space name"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!canDeactivate}
            isLoading={deactivate.isPending}
            onClick={handleDeactivate}
          >
            Deactivate space
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
