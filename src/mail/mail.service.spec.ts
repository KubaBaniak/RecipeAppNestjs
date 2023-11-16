import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailModule } from './mail.module';
import { faker } from '@faker-js/faker';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let nestMailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailModule],
      providers: [
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    nestMailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should trigger sendMail function', async () => {
    const userEmail = faker.internet.email();
    const token = faker.string.alphanumeric();

    jest
      .spyOn(nestMailerService, 'sendMail')
      .mockImplementationOnce(() => Promise.resolve());

    await service.sendAccountActivationEmail(userEmail, token);

    expect(nestMailerService.sendMail).toHaveBeenCalled();
  });
});
