import { Webhook } from '@prisma/client';

export type ListWebhooksDto = Omit<Webhook, 'userId'>;
