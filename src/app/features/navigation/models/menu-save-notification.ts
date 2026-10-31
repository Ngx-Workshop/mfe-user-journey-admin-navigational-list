export type MenuSaveNotification = {
  status: 'saving' | 'saved' | 'error';
  name: string;
} | null;
