import { Injectable } from '@nestjs/common';
import { SESClient } from '@aws-sdk/client-ses';
import { SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  async sendEmail(command: SendEmailCommand) {
    try {
      return await this.sesClient.send(command);
    } catch (e) {
      console.error('Failed to send email.');
      console.log(e);
      return e;
    }
  }

  async sendAccountActivationEmail(
    userEmail: string,
    token: string,
  ): Promise<void> {
    const url = `http://localhost:3000/auth/activate-account/?token=${token}`;

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<a href="${url}"> CLICK HERE TO ACTIVATE YOUR ACCOUNT </a>`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Activate your account on Recipe App',
        },
      },
      Source: process.env.MAIL_USER,
      ReplyToAddresses: [process.env.MAIL_FROM],
    });

    await this.sendEmail(command);
  }
}
