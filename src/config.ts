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

export const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  captureIp: 'anonymize' as boolean | 'anonymize',
  autoInstrument: true,
  captureDeviceInfo: true,
  captureUsername: true,
  maxTelemetryEvents: 15,
  payload: {
    environment: process.env.ENVIRONMENT,
  },
};
