export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  category: TaskCategory;
  dependencies: string[];
  description?: string;
  assignee?: string;
}

export type TaskCategory = 'planning' | 'development' | 'testing' | 'deployment';

export interface Dependency {
  fromTaskId: string;
  toTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

export interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  timelineStart: Date;
  timelineEnd: Date;
}

export interface TaskFormData {
  name: string;
  startDate: string;
  endDate: string;
  category: TaskCategory;
  description: string;
  assignee: string;
  dependencies: string[];
}