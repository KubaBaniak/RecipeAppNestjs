import { Webhook } from '@prisma/client';

export class FetchWebhookResponse {
  constructor(
    public id: number,
    public name: string,
    public url: string,
    public types: string[],
  ) {}

  public static from(fetchedWebhook: Webhook): FetchWebhookResponse {
    return new FetchWebhookResponse(
      fetchedWebhook.id,
      fetchedWebhook.name,
      fetchedWebhook.url,
      fetchedWebhook.types,
    );
  }
}
