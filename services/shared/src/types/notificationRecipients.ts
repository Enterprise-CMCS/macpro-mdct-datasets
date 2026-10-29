export type NotificationRecipientRecord = {
  id: string;
  email: string;
  datasetId: string;
  addedBy: string;
  created: number;
};

export type CreateNotificationRecipientBody = {
  email: string;
  datasetId: string;
};
