import { Module } from '@nestjs/common';
import Next from 'next';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksSchedule } from '../console/schedules/tasks.schedule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SharedModule } from '../modules/shared.module';
import { CacheSchedule } from '../console/schedules/cache.schedule';

export const scheduleProvider = [
  TasksSchedule,
  CacheSchedule,
];
