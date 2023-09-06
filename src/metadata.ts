/* eslint-disable */
export default async () => {
  const t = {
    ['./webhook/dto/webhook-event-types']: await import(
      './webhook/dto/webhook-event-types'
    ),
    ['./auth/dto/sign-in-response']: await import(
      './auth/dto/sign-in-response'
    ),
    ['./auth/dto/sign-up-response']: await import(
      './auth/dto/sign-up-response'
    ),
    ['./auth/dto/create-pat-response']: await import(
      './auth/dto/create-pat-response'
    ),
    ['./recipe/dto/fetch-recipes-response']: await import(
      './recipe/dto/fetch-recipes-response'
    ),
    ['./recipe/dto/create-recipe-response']: await import(
      './recipe/dto/create-recipe-response'
    ),
    ['./recipe/dto/fetch-recipe-response']: await import(
      './recipe/dto/fetch-recipe-response'
    ),
    ['./recipe/dto/update-recipe-response']: await import(
      './recipe/dto/update-recipe-response'
    ),
    ['./recipe/dto/upload-images-response']: await import(
      './recipe/dto/upload-images-response'
    ),
    ['./webhook/dto/webhook-response']: await import(
      './webhook/dto/webhook-response'
    ),
    ['./webhook/dto/webhooks-response']: await import(
      './webhook/dto/webhooks-response'
    ),
  };
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./auth/dto/sign-in-response'),
          {
            SignInResponse: {
              accessToken: { required: true, type: () => String },
            },
          },
        ],
        [import('./user/dto/user-request'), { UserPayloadRequest: {} }],
        [import('./auth/dto/sign-up-response'), { SignUpResponse: {} }],
        [
          import('./auth/dto/sign-in-request'),
          {
            SignInRequest: {
              email: { required: true, type: () => String },
              password: { required: true, type: () => String, minLength: 12 },
            },
          },
        ],
        [
          import('./auth/dto/sign-up-request'),
          {
            SignUpRequest: {
              email: { required: true, type: () => String },
              password: { required: true, type: () => String, minLength: 12 },
            },
          },
        ],
        [
          import('./auth/dto/user-request'),
          {
            UserRequest: {
              email: { required: true, type: () => String },
              password: { required: true, type: () => String, minLength: 12 },
            },
          },
        ],
        [
          import('./auth/dto/create-pat-response'),
          {
            CreatePatResponse: {
              personalAccessToken: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./user/dto/create-user-request'),
          {
            CreateUserRequest: {
              email: { required: true, type: () => String },
              password: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./recipe/dto/create-recipe-request'),
          {
            CreateRecipeRequest: {
              title: { required: true, type: () => String },
              description: { required: false, type: () => String },
              ingredients: { required: true, type: () => String },
              preparation: { required: true, type: () => String },
              isPublic: { required: true, type: () => Boolean },
            },
          },
        ],
        [
          import('./recipe/dto/create-recipe-response'),
          {
            CreateRecipeResponse: {
              id: { required: true, type: () => Number },
              createdAt: { required: true, type: () => Date },
              title: { required: true, type: () => String },
              description: { required: true, type: () => String },
              ingredients: { required: true, type: () => String },
              preparation: { required: true, type: () => String },
              isPublic: { required: true, type: () => Boolean },
              authorId: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./recipe/dto/fetch-recipe-response'),
          { FetchRecipeResponse: {} },
        ],
        [
          import('./recipe/dto/fetch-recipes-response'),
          {
            FetchRecipesResponse: {
              fetchedRecipes: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import('./recipe/dto/update-recipe-request'),
          {
            UpdateRecipeRequest: {
              title: { required: false, type: () => String },
              description: { required: false, type: () => String },
              ingredients: { required: false, type: () => String },
              preparation: { required: false, type: () => String },
              isPublic: { required: false, type: () => Boolean },
            },
          },
        ],
        [
          import('./recipe/dto/update-recipe-response'),
          {
            UpdatedRecipeResponse: {
              id: { required: true, type: () => Number },
              title: { required: true, type: () => String },
              description: { required: true, type: () => String },
              ingredients: { required: true, type: () => String },
              preparation: { required: true, type: () => String },
              isPublic: { required: true, type: () => Boolean },
              authorId: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./webhook/dto/webhooks-response'),
          {
            FetchWebhooksResponse: {
              webhooks: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import('./webhook/dto/webhook-response'),
          { FetchWebhookResponse: {} },
        ],
        [
          import('./webhook/dto/create-webhook-request'),
          {
            CreateWebhookRequest: {
              name: { required: true, type: () => String },
              type: {
                required: true,
                enum: t['./webhook/dto/webhook-event-types'].WebhookEventType,
              },
              url: { required: true, type: () => String },
              token: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./recipe/dto/upload-images-response'),
          {
            UploadImagesResponse: {
              urls: { required: true, type: () => [String] },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./auth/auth.controller'),
          {
            AuthController: {
              signIn: { type: t['./auth/dto/sign-in-response'].SignInResponse },
              signUp: { type: t['./auth/dto/sign-up-response'].SignUpResponse },
              createPersonalAccessToken: {
                type: t['./auth/dto/create-pat-response'].CreatePatResponse,
              },
              activateAccount: {},
            },
          },
        ],
        [
          import('./recipe/recipe.controller'),
          {
            RecipeController: {
              fetchRecipes: {
                type: t['./recipe/dto/fetch-recipes-response']
                  .FetchRecipesResponse,
              },
              createRecipe: {
                type: t['./recipe/dto/create-recipe-response']
                  .CreateRecipeResponse,
              },
              fetchRecipe: {
                type: t['./recipe/dto/fetch-recipe-response']
                  .FetchRecipeResponse,
              },
              updateRecipe: {
                type: t['./recipe/dto/update-recipe-response']
                  .UpdatedRecipeResponse,
              },
              deleteRecipe: {},
              uploadFile: {
                type: t['./recipe/dto/upload-images-response']
                  .UploadImagesResponse,
              },
            },
          },
        ],
        [
          import('./webhook/webhook.controller'),
          {
            WebhookController: {
              createWebhook: {
                type: t['./webhook/dto/webhook-response'].FetchWebhookResponse,
              },
              deleteWebhook: {},
              listWebhooks: {
                type: t['./webhook/dto/webhooks-response']
                  .FetchWebhooksResponse,
              },
            },
          },
        ],
      ],
    },
  };
};
