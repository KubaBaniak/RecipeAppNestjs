import { faker } from '@faker-js/faker';
import { WebhookEventType } from '../dto';

const MAX_I32 = 2147483647;

type CreateWebhookRequestOverrides = {
  id?: number;
  name?: string;
  types?: WebhookEventType[];
  url?: string;
  token?: string;
};

export const createWebhookRequest = (
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  name: overrides.name ?? faker.word.noun(),
  types: overrides.types ?? [WebhookEventType.RecipeCreated],
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
});

export const createWebhookWithUserId = (
  userId: number,
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  id: overrides.id ?? faker.number.int({ max: MAX_I32 }),
  name: overrides.name ?? faker.word.noun(),
  types: overrides.types ?? [WebhookEventType.RecipeCreated],
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
  userId,
  initVector: faker.string.alphanumeric(16),
  authTag: faker.string.alphanumeric(16),
});

export function createWebhookResponse() {
  return {
    id: faker.number.int({ max: MAX_I32 }),
    name: faker.word.noun(),
    url: faker.internet.url(),
    types: [WebhookEventType.RecipeCreated],
    token: '',
    initVector: '',
    authTag: '',
    userId: faker.number.int(),
  };
}
