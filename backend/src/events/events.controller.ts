import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { EventsService } from './events.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { User } from '@prisma/client';

const HexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const CreateEventSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().max(5000).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    color: z
      .string()
      .regex(HexColorRegex, 'Must be a valid hex color')
      .optional(),
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }),
    isPublic: z.boolean().optional(),
  })
  .refine((data) => new Date(data.startAt) < new Date(data.endAt), {
    message: 'startAt must be before endAt',
    path: ['endAt'],
  });

const UpdateEventSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    color: z
      .string()
      .regex(HexColorRegex, 'Must be a valid hex color')
      .optional(),
    startAt: z.string().datetime({ offset: true }).optional(),
    endAt: z.string().datetime({ offset: true }).optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        return new Date(data.startAt) < new Date(data.endAt);
      }
      return true;
    },
    {
      message: 'startAt must be before endAt',
      path: ['endAt'],
    },
  );

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all events (public + own private ones)',
    description:
      "Returns all public events plus the authenticated user's private events. Optionally filter by date range or owner.",
  })
  @ApiQuery({
    name: 'from',
    required: false,
    example: '2026-11-01T00:00:00Z',
    description:
      'ISO 8601 datetime — only return events ending after this date',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    example: '2026-11-30T23:59:59Z',
    description:
      'ISO 8601 datetime — only return events starting before this date',
  })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    description: 'Filter events belonging to a specific user ID',
  })
  findAll(
    @Request() req: { user: User },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.eventsService.findAll(req.user.id, { from, to, ownerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 403, description: 'Event is private' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.eventsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  create(
    @Request() req: { user: User },
    @Body({ schema: CreateEventSchema })
    body: z.infer<typeof CreateEventSchema>,
  ) {
    return this.eventsService.create(req.user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event (owner only)' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id') id: string,
    @Request() req: { user: User },
    @Body({ schema: UpdateEventSchema })
    body: z.infer<typeof UpdateEventSchema>,
  ) {
    return this.eventsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event (owner only)' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.eventsService.remove(id, req.user.id);
  }
}
