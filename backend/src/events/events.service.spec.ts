import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { CalendarEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsService } from './events.service.js';

describe('EventsService', () => {
  const findMany = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const deleteEvent = vi.fn();
  let eventsService: EventsService;

  const event: CalendarEvent = {
    id: 'event-id',
    title: 'Planning',
    description: null,
    location: null,
    color: '#3B82F6',
    startAt: new Date('2026-11-20T09:00:00.000Z'),
    endAt: new Date('2026-11-20T10:00:00.000Z'),
    isPublic: false,
    ownerId: 'owner-id',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventsService = new EventsService({
      calendarEvent: {
        findMany,
        findUnique,
        create,
        update,
        delete: deleteEvent,
      },
    } as unknown as PrismaService);
  });

  it('filters visible events by date, owner, and requesting user', async () => {
    findMany.mockResolvedValue([]);

    await eventsService.findAll('viewer-id', {
      from: '2026-11-01T00:00:00.000Z',
      to: '2026-11-30T23:59:59.000Z',
      ownerId: 'owner-id',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        endAt: { gte: new Date('2026-11-01T00:00:00.000Z') },
        startAt: { lte: new Date('2026-11-30T23:59:59.000Z') },
        ownerId: 'owner-id',
        OR: [
          { isPublic: true },
          { isPublic: false, ownerId: 'viewer-id' },
        ],
      },
      include: { owner: { omit: { password: true } } },
      orderBy: { startAt: 'asc' },
    });
  });

  it('rejects access to another user’s private event', async () => {
    findUnique.mockResolvedValue(event);

    await expect(
      eventsService.findOne(event.id, 'viewer-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns not found when updating a missing event', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      eventsService.update('missing-id', 'owner-id', { title: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('prevents a non-owner from deleting an event', async () => {
    findUnique.mockResolvedValue(event);

    await expect(
      eventsService.remove(event.id, 'viewer-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it('converts event dates and applies defaults when creating', async () => {
    create.mockResolvedValue(event);

    await eventsService.create('owner-id', {
      title: 'Planning',
      startAt: '2026-11-20T09:00:00.000Z',
      endAt: '2026-11-20T10:00:00.000Z',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        title: 'Planning',
        description: null,
        location: null,
        color: '#3B82F6',
        startAt: new Date('2026-11-20T09:00:00.000Z'),
        endAt: new Date('2026-11-20T10:00:00.000Z'),
        isPublic: true,
        ownerId: 'owner-id',
      },
    });
  });
});
