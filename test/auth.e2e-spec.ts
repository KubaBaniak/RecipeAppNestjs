import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { INestApplication } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Cats', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuthModule],
            providers: [AuthService, UserService, PrismaService],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it('should do nothing', () => { });
    afterAll(async () => {
        await app.close();
    });
});
