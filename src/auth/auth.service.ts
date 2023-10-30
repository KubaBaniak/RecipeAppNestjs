import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { PendingUsersRepository } from '../user/pending-user.repository';
import { UserPayloadRequest } from '../user/dto';
import {
  ClientProxy,
  RmqRecordBuilder,
  RpcException,
} from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { SignInRequest, SignUpRequest, UserRequest } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly pendingUsersRepository: PendingUsersRepository,
    private readonly userRepository: UserRepository,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.authClient.connect();
  }

  async signUp(
    signUpRequest: SignUpRequest,
  ): Promise<{ email: string; accountActivationToken: string }> {
    const [pendingUser, user] = await Promise.all([
      this.pendingUsersRepository.getPendingUserByEmail(signUpRequest.email),
      this.userRepository.getUserByEmail(signUpRequest.email),
    ]);

    if (pendingUser || user) {
      throw new ForbiddenException();
    }

    const data = { email: signUpRequest.email };
    const createdUser = await this.pendingUsersRepository.createPendingUser(
      data,
    );
    const signUpPayload = new RmqRecordBuilder({
      userId: createdUser.id,
      password: signUpRequest.password,
    }).build();

    const { accountActivationToken } = await firstValueFrom(
      this.authClient.send('signup', signUpPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );
    return { email: createdUser.email, accountActivationToken };
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmail(signInRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const signInPayload = new RmqRecordBuilder({
      userId: user.id,
      password: signInRequest.password,
      token: signInRequest.token,
    }).build();

    const { accessToken } = await firstValueFrom(
      this.authClient.send('signin', signInPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return accessToken;
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const createPatPayload = new RmqRecordBuilder({
      userId,
    }).build();

    const { personalAccessToken } = await firstValueFrom(
      this.authClient
        .send('create-personal-access-token', createPatPayload)
        .pipe(
          catchError((err) => {
            throw new RpcException(err.response);
          }),
        ),
    );

    return personalAccessToken;
  }

  async validateUser(userRequest: UserRequest): Promise<UserPayloadRequest> {
    const user = await this.userRepository.getUserByEmail(userRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const validateUserPayload = new RmqRecordBuilder({
      userId: user.id,
      password: userRequest.password,
    }).build();

    const validatedUserId = await firstValueFrom(
      this.authClient.send('validate-user', validateUserPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return validatedUserId;
  }

  async activateAccount(token: string): Promise<UserPayloadRequest> {
    const activateAccountPayload = new RmqRecordBuilder({
      token,
    }).build();

    const userId = await firstValueFrom(
      this.authClient.send('activate-account', activateAccountPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    const userData = await this.pendingUsersRepository.getPendingUserById(
      userId,
    );

    if (!userData) {
      throw new NotFoundException(
        'User account data for activation was not found. Please ensure you provided correct token or check if User is already activated',
      );
    }

    const createdUser = this.userRepository.createUser(userData);

    await this.pendingUsersRepository.removePendingUserById(userId);

    return createdUser;
  }

  async changePassword(userId: number, newPassword: string): Promise<number> {
    const changePasswordPayload = new RmqRecordBuilder({
      userId,
      newPassword,
    }).build();

    await firstValueFrom(
      this.authClient.send('change-password', changePasswordPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return userId;
  }

  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.userRepository.getUserByEmail(email);
    const generateResetPassToken = new RmqRecordBuilder({
      userId: user.id,
    }).build();

    const token = await firstValueFrom(
      this.authClient
        .send('generate-password-reset-token', generateResetPassToken)
        .pipe(
          catchError((err) => {
            throw new RpcException(err.response);
          }),
        ),
    );

    return token;
  }

  async createQrCodeFor2fa(userId: number): Promise<string> {
    const create2faQrCodePayload = new RmqRecordBuilder({
      userId,
    }).build();

    const { qrCodeUrl } = await firstValueFrom(
      this.authClient.send('create-2fa-qrcode', create2faQrCodePayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return qrCodeUrl;
  }

  async generate2faRecoveryKeys(userId: number): Promise<string[]> {
    const generate2faRecoveryKeysPayload = new RmqRecordBuilder({
      userId,
    }).build();

    const { recoveryKeys } = await firstValueFrom(
      this.authClient
        .send('create-2fa-qrcode', generate2faRecoveryKeysPayload)
        .pipe(
          catchError((err) => {
            throw new RpcException(err.response);
          }),
        ),
    );

    return recoveryKeys;
  }

  async enable2fa(userId: number, providedToken: string): Promise<string[]> {
    const enable2faPayload = new RmqRecordBuilder({
      userId,
      token: providedToken,
    }).build();

    const { recoveryKeys } = await firstValueFrom(
      this.authClient.send('enable-2fa', enable2faPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return recoveryKeys;
  }

  async disable2fa(userId: number): Promise<number> {
    const disable2faPayload = new RmqRecordBuilder({
      userId,
    }).build();

    const twoFactorObject = await firstValueFrom(
      this.authClient.send('disable-2fa', disable2faPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return twoFactorObject.id;
  }

  async verify2fa(userId: number, token: string): Promise<string> {
    const verify2faPayload = new RmqRecordBuilder({
      userId,
      token,
    }).build();

    const { accessToken } = await firstValueFrom(
      this.authClient.send('verify-2fa', verify2faPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return accessToken;
  }

  async regenerate2faRecoveryTokens(userId: number): Promise<string[]> {
    const regenerate2faRecoveryKeysPayload = new RmqRecordBuilder({
      userId,
    }).build();

    const { recoveryKeys } = await firstValueFrom(
      this.authClient.send('verify-2fa', regenerate2faRecoveryKeysPayload).pipe(
        catchError((err) => {
          throw new RpcException(err.response);
        }),
      ),
    );

    return recoveryKeys;
  }
}
