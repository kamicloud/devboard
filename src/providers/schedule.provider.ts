import { TasksSchedule } from '../console/schedules/tasks.schedule';
import { CacheSchedule } from '../console/schedules/cache.schedule';
import { JiraSchedule } from '../console/schedules/jira.schedule';

export const scheduleProvider = [
  TasksSchedule,
  CacheSchedule,
  JiraSchedule,
];
