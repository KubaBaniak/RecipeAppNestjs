export interface FetchedWebhook {
  id: number;
  name: string;
  url: string;
  type: string;
  token: string | null;
}

export class FetchWebhooksResponse {
  public fetchedWebhooks: FetchedWebhook[];

  constructor(fetchedWebhooks: FetchedWebhook[]) {
    this.fetchedWebhooks = fetchedWebhooks;
    console.log(this.fetchedWebhooks);
  }

  public static from(fetchedWebhooks: FetchedWebhook[]): FetchWebhooksResponse {
    return new FetchWebhooksResponse(fetchedWebhooks);
  }
}
