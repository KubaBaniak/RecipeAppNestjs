import { registerDecorator, ValidationOptions } from 'class-validator';
import { WebhookEventType } from './webhook-event-types';

export function NoDuplicateAndOtherTypes(
  property: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'NoDuplicateAndOtherTypes',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(eventTypes: string[]) {
          const eventTypeCounts: { [key: string]: number } = {};

          for (const eventType of eventTypes) {
            if (
              Object.values(WebhookEventType).includes(
                eventType as WebhookEventType,
              )
            ) {
              if (eventTypeCounts[eventType]) {
                return false;
              } else {
                eventTypeCounts[eventType] = 1;
              }
            } else {
              return false;
            }
          }

          return true;
        },
      },
    });
  };
}
