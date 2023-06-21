import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export function initalizeSwagger(): Omit<OpenAPIObject, 'paths'> {
  const config = new DocumentBuilder()
    .setTitle('Recipe App')
    .setDescription(
      'API used to manage users and their recipes which they share to the world',
    )
    .setVersion('1.0')
    .addTag('Recipes')
    .addBearerAuth()
    .build();

  return config;
}
