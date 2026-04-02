import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { EmailServicePort } from '@common/ports/email-service.port';
import { TokenServicePort } from '@auth/application/ports/token.service.port';
import { GenerateAccountSetupTokenUseCase } from './generate-account-setup-token.use-case'; 
import { SignupDto } from '@auth/application/dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@users/domain/entities/user.entity';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenRepository: TokenRepositoryPort,
    private readonly emailService: EmailServicePort,
    private readonly tokenService: TokenServicePort,
    private readonly configService: ConfigService,
    private readonly generateAccountSetupTokenUseCase: GenerateAccountSetupTokenUseCase,
  ) { }

  async execute(signupDto: SignupDto): Promise<User> {
    const { email, password, firstName, lastName } = signupDto;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const user = new User(
      0, // ID will be set by the repository
      firstName,
      lastName,
      email,
      hashedPassword,
    );

    const savedUser = await this.userRepository.createWithRoles(user, [3]); // Assign default role "User"

    // Not sure if accessing the token generation use case directly like this is the best approach
    // LET ME KNOW IF THIS BREAKS ANY ARCHITECTURAL RULES
    // I just wanted to reuse the logic for generating the token and sending the email without duplicating code
    // This message was not written with AI btw, this is actually me
    const { token, expiresAt } = await this.generateAccountSetupTokenUseCase.execute(savedUser.id);

    await this.emailService.sendSignupConfirmationEmail({
      to: email,
      firstName,
      invitationLink: this.configService.get('FRONTEND_URL') + '/auth/confirm?token=' + token, // this screen needs to be created
    });

    return savedUser;
  }
}
