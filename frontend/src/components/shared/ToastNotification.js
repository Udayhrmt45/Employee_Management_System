import { toast } from 'sonner';

// Utility wrapper hook to simplify toast notifications
export function useToastNotification() {
  const notifySuccess = (title, description) => {
    toast.success(title, { description });
  };

  const notifyError = (title, description) => {
    toast.error(title, { description });
  };

  const notifyInfo = (title, description) => {
    toast.info(title, { description });
  };

  return { notifySuccess, notifyError, notifyInfo };
}
