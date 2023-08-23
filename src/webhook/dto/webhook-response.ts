export interface FetchedWebhook {
  id: number;
  name: string;
  url: string;
  type: string;
}

export class FetchWebhooksResponse {
  public fetchedWebhooks: FetchedWebhook[];

  constructor(fetchedWebhooks: FetchedWebhook[]) {
    this.fetchedWebhooks = fetchedWebhooks;
  }

  public static from(fetchedWebhooks: FetchedWebhook[]): FetchWebhooksResponse {
    return new FetchWebhooksResponse(fetchedWebhooks);
  }
}
