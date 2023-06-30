import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class JwtTokenExtractor {
  public JwtToken: Promise<string>;

  public async getToken(app: INestApplication): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .set('Accept', 'application/json')
      .send({
        email: 'test@gmail.com',
        password: 'testpassword123',
      });
    this.JwtToken = loginResponse.body;
    console.log(loginResponse.body);
    return loginResponse.body;
  }
}
