import { Module } from '@nestjs/common';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
