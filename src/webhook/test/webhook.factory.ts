import { faker } from '@faker-js/faker';
import { WebhookEventType } from '../dto';

type CreateWebhookRequestOverrides = {
  id?: number;
  name?: string;
  type?: WebhookEventType;
  url?: string;
  token?: string;
};

export const createWebhookRequest = (
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  name: overrides.name ?? faker.word.noun(),
  type: overrides.type ?? WebhookEventType.RecipeCreated,
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
});

export const createWebhookWithUserId = (
  userId: number,
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  id: overrides.id ?? faker.number.int({ max: 65535 }),
  name: overrides.name ?? faker.word.noun(),
  type: overrides.type ?? WebhookEventType.RecipeCreated,
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
  userId,
  initVector: faker.string.alphanumeric(16),
  authTag: faker.string.alphanumeric(16),
});

export function createWebhookResponse() {
  return {
    id: faker.number.int({ max: 128 }),
    name: faker.word.noun(),
    url: faker.internet.url(),
    type: WebhookEventType.RecipeCreated,
    token: '',
    initVector: '',
    authTag: '',
    userId: faker.number.int(),
  };
}
