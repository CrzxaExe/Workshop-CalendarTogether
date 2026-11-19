import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CalendarEvent, Prisma } from '@prisma/client';

export type EventWithOwner = CalendarEvent & {
  owner: Omit<Prisma.UserGetPayload<object>, 'password'>;
};

export interface CreateEventDto {
  title: string;
  description?: string | null;
  location?: string | null;
  color?: string;
  startAt: string;
  endAt: string;
  isPublic?: boolean;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface FindEventsQuery {
  from?: string;
  to?: string;
  ownerId?: string;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    requestingUserId: string,
    query: FindEventsQuery,
  ): Promise<EventWithOwner[]> {
    // Date overlap filter: event.startAt <= to AND event.endAt >= from
    const dateFilter: Prisma.CalendarEventWhereInput = {
      ...(query.from ? { endAt: { gte: new Date(query.from) } } : {}),
      ...(query.to ? { startAt: { lte: new Date(query.to) } } : {}),
    };

    const ownerFilter = query.ownerId ? { ownerId: query.ownerId } : {};

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        ...dateFilter,
        ...ownerFilter,
        OR: [
          { isPublic: true },
          { isPublic: false, ownerId: requestingUserId },
        ],
      },
      include: { owner: { omit: { password: true } } },
      orderBy: { startAt: 'asc' },
    });

    return events as EventWithOwner[];
  }

  async findOne(id: string, requestingUserId: string): Promise<EventWithOwner> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: { owner: { omit: { password: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (!event.isPublic && event.ownerId !== requestingUserId) {
      throw new ForbiddenException('This event is private');
    }

    return event as EventWithOwner;
  }

  create(ownerId: string, dto: CreateEventDto): Promise<CalendarEvent> {
    return this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        location: dto.location ?? null,
        color: dto.color ?? '#3B82F6',
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        isPublic: dto.isPublic ?? true,
        ownerId,
      },
    });
  }

  async update(
    id: string,
    requestingUserId: string,
    dto: UpdateEventDto,
  ): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });

    if (!event) throw new NotFoundException('Event not found');
    if (event.ownerId !== requestingUserId) {
      throw new ForbiddenException('You can only edit your own events');
    }

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.startAt !== undefined ? { startAt: new Date(dto.startAt) } : {}),
        ...(dto.endAt !== undefined ? { endAt: new Date(dto.endAt) } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      },
    });
  }

  async remove(id: string, requestingUserId: string): Promise<void> {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });

    if (!event) throw new NotFoundException('Event not found');
    if (event.ownerId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.prisma.calendarEvent.delete({ where: { id } });
  }
}
