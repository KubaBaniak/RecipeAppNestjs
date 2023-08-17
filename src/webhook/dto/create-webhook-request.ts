export interface CreateWebhookRequest {
  name: string;
  type: string;
  url: string;
  token?: string;
}
