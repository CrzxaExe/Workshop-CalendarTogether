import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const findUnique = vi.fn();
  const create = vi.fn();
  let usersService: UsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    usersService = new UsersService({
      user: { findUnique, create },
    } as unknown as PrismaService);
  });

  it('finds a user by email', async () => {
    findUnique.mockResolvedValue({ id: 'user-id' });

    await expect(usersService.findByEmail('user@example.com')).resolves.toEqual({
      id: 'user-id',
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
  });

  it('finds a user by id', async () => {
    findUnique.mockResolvedValue({ id: 'user-id' });

    await expect(usersService.findById('user-id')).resolves.toEqual({
      id: 'user-id',
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });

  it('creates a user with the provided data', async () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
    };
    create.mockResolvedValue({ id: 'user-id', ...data });

    await expect(usersService.create(data)).resolves.toMatchObject(data);
    expect(create).toHaveBeenCalledWith({ data });
  });
});
