import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAccountActivationEmail(
    userEmail: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const url = `${process.env.BASE_URL}/auth/activate-account/?token=${token}`;

    return this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './account-activation-email',
      context: {
        activationLink: url,
      },
    });
  }

  async sendResetPasswordEmail(
    userEmail: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const url = `${process.env.BASE_URL}/auth/reset-password/?token=${token}`;

    return this.mailerService.sendMail({
      to: userEmail,
      subject: 'Reset your password',
      template: './reset-password-email',
      context: {
        resetLink: url,
      },
    });
  }
}
