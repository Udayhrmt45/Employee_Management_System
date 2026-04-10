import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className={isDanger ? 'border-destructive/20' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent closing immediately if loading
                onConfirm();
              }}
              disabled={isLoading}
              className={isDanger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
