import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    const authUrl = `http://localhost:3000/auth`;

    const mockUserRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuthModule],
            providers: [AuthService, UserService, PrismaService],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    describe('/auth/signup (POST)', () => {
        it('should register a user and return the new user object', () => {
            return request(authUrl)
                .post('/signup')
                .set('Accept', 'application/json')
                .send(mockUserRequest)
                .expect((response: request.Response) => {
                    const { id, email, role } = response.body;
                    expect(id).toEqual(expect.any(Number));
                    expect(email).toEqual(mockUserRequest.email);
                    expect(role).toEqual(Role.USER);
                })
                .expect(HttpStatus.CREATED);
        });
        it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', () => {
            return request(authUrl)
                .post('/signup')
                .set('Accept', 'application/json')
                .send(mockUserRequest)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('/auth/signin (POST)', () => {
        it('should generate access token for user', () => {
            return request(authUrl)
                .post('/signin')
                .set('Accept', 'application/json')
                .send(mockUserRequest)
                .expect((response: request.Response) => {
                    const { accessToken } = response.body;
                    expect(accessToken).toEqual(expect.any(String));
                })
                .expect(HttpStatus.OK);
        });

        it('should not generate access token for user (wrong email) and return 401 error (UNAUTHENTICATED)', () => {
            return request(authUrl)
                .post('/signin')
                .set('Accept', 'application/json')
                .send({
                    email: mockUserRequest.email + 'iLoveYouDad',
                    password: mockUserRequest.password,
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should not generate access token for user (wrong password) and return 401 error (UNAUTHENTICATED)', () => {
            return request(authUrl)
                .post('/signin')
                .set('Accept', 'application/json')
                .send({
                    email: mockUserRequest.email,
                    password: mockUserRequest.password + 'iLoveYouMom',
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
