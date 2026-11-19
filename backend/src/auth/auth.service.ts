import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import type { User } from '@prisma/client';

export interface AuthTokens {
  access_token: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    return this.generateTokens(user);
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User): AuthTokens {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }
}
