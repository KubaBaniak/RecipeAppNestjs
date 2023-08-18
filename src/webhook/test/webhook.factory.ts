import { faker } from '@faker-js/faker';
import { WebhookEvent } from '../dto';

type CreateWebhookRequestOverrides = {
  name?: string;
  type?: WebhookEvent;
  url?: string;
  token?: string;
};

export const createWebhookRequest = (
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  name: overrides.name ?? faker.word.noun(),
  type: overrides.type ?? WebhookEvent.RecipeCreated,
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
});

export const createWebhookWithUserId = (
  userId: number,
  overrides: CreateWebhookRequestOverrides = {},
) => ({
  name: overrides.name ?? faker.word.noun(),
  type: overrides.type ?? WebhookEvent.RecipeCreated,
  url: overrides.url ?? faker.internet.url(),
  token: overrides.token ?? faker.string.alphanumeric(32),
  userId,
});
