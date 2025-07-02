import { format, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const calculateDuration = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1;
};

export const addBusinessDays = (date: Date, days: number): Date => {
  return addDays(date, days);
};

export const getDateRange = (tasks: Task[]): { start: Date; end: Date } => {
  if (tasks.length === 0) {
    const today = new Date();
    return {
      start: today,
      end: addDays(today, 30)
    };
  }

  const dates = tasks.flatMap(task => [task.startDate, task.endDate]);
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    start: addDays(minDate, -7),
    end: addDays(maxDate, 7)
  };
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};