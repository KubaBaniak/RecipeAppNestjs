import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAccountActivationEmail(
    userEmail: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const url = `http://localhost:3000/auth/activate-account/?token=${token}`;

    return this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome to Nice App! Confirm your Email',
      html: `<a href="${url}"> CLICK HERE TO ACTIVATE YOUR ACCOUNT </a>`,
    });
  }
}
