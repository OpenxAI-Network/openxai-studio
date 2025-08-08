import React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteProps {
  deleteServiceOpen: string | null
  setDeleteServiceOpen: (value: string | null) => void
  deleteService: () => void
}

const Delete = ({
  deleteServiceOpen,
  setDeleteServiceOpen,
  deleteService,
}: DeleteProps) => {
  return (
    <AlertDialog
      open={!!deleteServiceOpen}
      onOpenChange={() => setDeleteServiceOpen(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete {deleteServiceOpen}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and you will need to reinstall the
            service if you want to use it again.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteService}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default Delete
