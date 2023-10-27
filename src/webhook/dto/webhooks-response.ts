export interface FetchedWebhook {
  id: number;
  name: string;
  url: string;
  types: string[];
}

export class FetchWebhooksResponse {
  public webhooks: FetchedWebhook[];

  constructor(fetchedWebhooks: FetchedWebhook[]) {
    this.webhooks = fetchedWebhooks;
  }

  public static from(fetchedWebhooks: FetchedWebhook[]): FetchWebhooksResponse {
    return new FetchWebhooksResponse(fetchedWebhooks);
  }
}
