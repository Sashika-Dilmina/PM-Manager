import React from 'react';
import { Edit, Trash2, Calendar, User, Clock } from 'lucide-react';
import { Task } from '../types';
import { formatDisplayDate, calculateDuration } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/ganttUtils';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onProgressUpdate: (taskId: string, progress: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskEdit, onTaskDelete, onProgressUpdate }) => {
  const getCategoryLabel = (category: string): string => {
    const labels = {
      planning: 'Planning',
      development: 'Development',
      testing: 'Testing',
      deployment: 'Deployment'
    };
    return labels[category as keyof typeof labels] || 'Development';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No tasks yet</p>
        <p className="text-gray-400 text-sm">Add your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const colors = getCategoryColor(task.category);
        const duration = calculateDuration(task.startDate, task.endDate);
        
        return (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">{task.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} bg-opacity-20`}>
                    {getCategoryLabel(task.category)}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatDisplayDate(task.startDate)} - {formatDisplayDate(task.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {task.assignee && (
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{task.assignee}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${colors.bg}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => onProgressUpdate(task.id, parseInt(e.target.value))}
                    className="w-full mt-2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onTaskEdit(task)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;