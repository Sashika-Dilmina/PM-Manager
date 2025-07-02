import { Task } from '../types';
import { differenceInDays, startOfDay } from 'date-fns';

export const calculateTaskPosition = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  containerWidth: number
): { left: number; width: number } => {
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  const dayWidth = containerWidth / totalDays;
  
  const startOffset = differenceInDays(startOfDay(task.startDate), startOfDay(timelineStart));
  const taskDuration = differenceInDays(startOfDay(task.endDate), startOfDay(task.startDate)) + 1;
  
  return {
    left: Math.max(0, startOffset * dayWidth),
    width: Math.max(dayWidth, taskDuration * dayWidth)
  };
};

export const getCategoryColor = (category: string): { bg: string; border: string; text: string } => {
  const colors = {
    planning: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      text: 'text-blue-900'
    },
    development: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      text: 'text-green-900'
    },
    testing: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      text: 'text-amber-900'
    },
    deployment: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      text: 'text-red-900'
    }
  };
  
  return colors[category as keyof typeof colors] || colors.development;
};

export const validateTaskDependencies = (tasks: Task[]): string[] => {
  const errors: string[] = [];
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      const depTask = taskMap.get(depId);
      if (depTask && depTask.endDate >= task.startDate) {
        errors.push(`Task "${task.name}" cannot start before its dependency "${depTask.name}" ends`);
      }
    });
  });
  
  return errors;
};