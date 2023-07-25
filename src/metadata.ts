/* eslint-disable */
export default async () => {
  const t = {
    ['./auth/dto/sign-in-response']: await import(
      './auth/dto/sign-in-response'
    ),
    ['./auth/dto/sign-up-response']: await import(
      './auth/dto/sign-up-response'
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
          {
            FetchRecipeResponse: {
              fetchedRecipe: { required: true, type: () => Object },
            },
          },
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
          import('./recipe/dto/optional-author-request'),
          {
            OptionalAuthorRequest: {
              authorId: { required: false, type: () => Number },
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
      ],
    },
  };
};
