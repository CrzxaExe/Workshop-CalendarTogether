import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findByEmail = vi.fn();
  const create = vi.fn();
  const sign = vi.fn();
  let authService: AuthService;

  const user: User = {
    id: 'user-id',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'stored-hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(
      { findByEmail, create } as unknown as UsersService,
      { sign } as unknown as JwtService,
    );
    sign.mockReturnValue('access-token');
  });

  it('registers a user, hashes their password, and omits it from the response', async () => {
    findByEmail.mockResolvedValue(null);
    create.mockImplementation(async (data) => ({ ...user, ...data }));

    const result = await authService.register({
      name: user.name,
      email: user.email,
      password: 'plain-password',
    });

    expect(findByEmail).toHaveBeenCalledWith(user.email);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: user.name,
        email: user.email,
        password: expect.not.stringMatching(/^plain-password$/),
      }),
    );
    await expect(
      bcrypt.compare('plain-password', create.mock.calls[0][0].password),
    ).resolves.toBe(true);
    expect(sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    expect(result).toEqual({
      access_token: 'access-token',
      user: expect.not.objectContaining({ password: expect.anything() }),
    });
  });

  it('rejects registration when the email is already in use', async () => {
    findByEmail.mockResolvedValue(user);

    await expect(
      authService.register({
        name: user.name,
        email: user.email,
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });

  it('rejects login when the user does not exist', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: user.email, password: 'password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sign).not.toHaveBeenCalled();
  });

  it('rejects login when the password is incorrect', async () => {
    findByEmail.mockResolvedValue({
      ...user,
      password: await bcrypt.hash('correct-password', 1),
    });

    await expect(
      authService.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sign).not.toHaveBeenCalled();
  });
});
