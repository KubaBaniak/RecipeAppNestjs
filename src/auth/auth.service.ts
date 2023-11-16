import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { PendingUsersRepository } from '../user/pending-user.repository';
import { UserPayloadRequest } from '../user/dto';
import { SignInRequest, SignUpRequest, UserRequest } from './dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

type MicroserviceReturn = {
  [key: string]: any;
  message: string;
  status: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly pendingUsersRepository: PendingUsersRepository,
    private readonly userRepository: UserRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  private exchange = 'authentication';

  isMicroserviceError(payload: unknown): payload is MicroserviceReturn {
    const hasMessage = (payload as MicroserviceReturn).message !== undefined;
    const hasStatus = (payload as MicroserviceReturn).status !== undefined;

    return hasMessage && hasStatus;
  }

  validateAuthMicroserviceReturn(payload: unknown) {
    if (this.isMicroserviceError(payload)) {
      throw new HttpException(payload.message, payload.status);
    }
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

    const payload = {
      userId: createdUser.id,
      password: signUpRequest.password,
    };

    const accountActivationTokenObject = await this.amqpConnection.request<{
      accountActivationToken: string;
    }>({
      exchange: this.exchange,
      routingKey: 'signup',
      payload,
    });

    this.validateAuthMicroserviceReturn(accountActivationTokenObject);

    return {
      email: createdUser.email,
      accountActivationToken:
        accountActivationTokenObject.accountActivationToken,
    };
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmail(signInRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      userId: user.id,
      password: signInRequest.password,
      token: signInRequest.token,
    };

    const accessTokenObject = await this.amqpConnection.request<{
      accessToken: string;
    }>({
      exchange: this.exchange,
      routingKey: 'signin',
      payload,
    });

    this.validateAuthMicroserviceReturn(accessTokenObject);

    return accessTokenObject.accessToken;
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const payload = { userId };

    const personalAccessTokenObject = await this.amqpConnection.request<{
      personalAccessToken: string;
    }>({
      exchange: this.exchange,
      routingKey: 'add-personal-access-token',
      payload,
    });

    this.validateAuthMicroserviceReturn(personalAccessTokenObject);

    return personalAccessTokenObject.personalAccessToken;
  }

  async validateAuthToken(token: string): Promise<number> {
    const payload = { token };

    const userIdObject = await this.amqpConnection.request<{ id: number }>({
      exchange: this.exchange,
      routingKey: 'validate-jwt-token',
      payload,
    });

    this.validateAuthMicroserviceReturn(userIdObject);

    return userIdObject.id;
  }

  async validateUser(userRequest: UserRequest): Promise<number> {
    const user = await this.userRepository.getUserByEmail(userRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { userId: user.id, password: userRequest.password };

    const validatedUserId = await this.amqpConnection.request<number>({
      exchange: this.exchange,
      routingKey: 'validate-user',
      payload,
    });

    this.validateAuthMicroserviceReturn(validatedUserId);

    return validatedUserId;
  }

  async activateAccount(token: string): Promise<UserPayloadRequest> {
    const payload = { token };

    const userId = await this.amqpConnection.request<number>({
      exchange: this.exchange,
      routingKey: 'activate-account',
      payload,
    });

    this.validateAuthMicroserviceReturn(userId);

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
    const payload = { userId, newPassword };

    const changedPasswordUserId = await this.amqpConnection.request<number>({
      exchange: this.exchange,
      routingKey: 'change-password',
      payload,
    });

    this.validateAuthMicroserviceReturn(changedPasswordUserId);

    return changedPasswordUserId;
  }

  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.userRepository.getUserByEmail(email);

    const payload = { userId: user.id };

    const token = await this.amqpConnection.request<string>({
      exchange: this.exchange,
      routingKey: 'generate-password-reset-token',
      payload,
    });

    this.validateAuthMicroserviceReturn(token);

    return token;
  }

  async createQrCodeFor2fa(userId: number): Promise<string> {
    const payload = { userId };

    const qrCodeUrlObject = await this.amqpConnection.request<{
      qrCodeUrl: string;
    }>({
      exchange: this.exchange,
      routingKey: 'create-2fa-qrcode',
      payload,
    });

    this.validateAuthMicroserviceReturn(qrCodeUrlObject);

    return qrCodeUrlObject.qrCodeUrl;
  }

  async generate2faRecoveryKeys(userId: number): Promise<string[]> {
    const payload = { userId };

    const recoveryKeysObject = await this.amqpConnection.request<{
      recoveryKeys: string[];
    }>({
      exchange: this.exchange,
      routingKey: 'regenerate-2fa-recovery-keys',
      payload,
    });

    this.validateAuthMicroserviceReturn(recoveryKeysObject);

    return recoveryKeysObject.recoveryKeys;
  }

  async enable2fa(userId: number, providedToken: string): Promise<string[]> {
    const payload = { userId, token: providedToken };

    const recoveryKeysObject = await this.amqpConnection.request<{
      recoveryKeys: string[];
    }>({
      exchange: this.exchange,
      routingKey: 'enable-2fa',
      payload,
    });

    this.validateAuthMicroserviceReturn(recoveryKeysObject);

    return recoveryKeysObject.recoveryKeys;
  }

  async disable2fa(userId: number): Promise<number> {
    const payload = { userId };

    const userTwoFactorAuthId = await this.amqpConnection.request<number>({
      exchange: this.exchange,
      routingKey: 'disable-2fa',
      payload,
    });

    this.validateAuthMicroserviceReturn(userTwoFactorAuthId);

    return userTwoFactorAuthId;
  }

  async verify2fa(userId: number, token: string): Promise<string> {
    const payload = { userId, token };

    const accessTokenObject = await this.amqpConnection.request<{
      accessToken: string;
    }>({
      exchange: this.exchange,
      routingKey: 'verify-2fa',
      payload,
    });

    this.validateAuthMicroserviceReturn(accessTokenObject);

    return accessTokenObject.accessToken;
  }

  async regenerate2faRecoveryTokens(userId: number): Promise<string[]> {
    const payload = { userId };

    const recoveryKeysObject = await this.amqpConnection.request<{
      recoveryKeys: string[];
    }>({
      exchange: this.exchange,
      routingKey: 'regenerate-2fa-recovery-keys',
      payload,
    });

    this.validateAuthMicroserviceReturn(recoveryKeysObject);

    return recoveryKeysObject.recoveryKeys;
  }
}
