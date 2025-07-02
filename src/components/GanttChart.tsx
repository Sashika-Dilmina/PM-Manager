import React, { useRef, useEffect, useState } from 'react';
import { Task } from '../types';
import { formatDisplayDate, calculateDuration } from '../utils/dateUtils';
import { calculateTaskPosition, getCategoryColor } from '../utils/ganttUtils';
import { format, eachDayOfInterval, isWeekend } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, timelineStart, timelineEnd, onTaskUpdate }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (chartRef.current) {
        setContainerWidth(chartRef.current.offsetWidth - 200); // Account for task labels
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });
  const dayWidth = containerWidth / days.length;

  const handleTaskDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  const renderTimelineHeader = () => (
    <div className="flex sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="w-48 flex-shrink-0 p-3 font-medium text-gray-900 bg-gray-50">
        Tasks
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex" style={{ width: containerWidth }}>
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={`flex-shrink-0 text-xs text-center p-2 border-r border-gray-100 ${
                isWeekend(day) ? 'bg-gray-50' : ''
              }`}
              style={{ width: dayWidth }}
            >
              <div className="font-medium">{format(day, 'MMM dd')}</div>
              <div className="text-gray-500">{format(day, 'EEE')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTaskRow = (task: Task) => {
    const position = calculateTaskPosition(task, timelineStart, timelineEnd, containerWidth);
    const colors = getCategoryColor(task.category);
    const duration = calculateDuration(task.startDate, task.endDate);

    return (
      <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 group">
        <div className="w-48 flex-shrink-0 p-3 border-r border-gray-100">
          <div className="font-medium text-sm text-gray-900 truncate">{task.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDisplayDate(task.startDate)} - {formatDisplayDate(task.endDate)}
          </div>
          <div className="text-xs text-gray-500">
            {duration} day{duration !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1 relative" style={{ height: '60px' }}>
          <div className="absolute inset-0 overflow-hidden">
            {/* Timeline grid */}
            {days.map((day, index) => (
              <div
                key={day.toISOString()}
                className={`absolute top-0 bottom-0 border-r border-gray-100 ${
                  isWeekend(day) ? 'bg-gray-50' : ''
                }`}
                style={{ left: index * dayWidth, width: dayWidth }}
              />
            ))}
            
            {/* Task bar */}
            <div
              className={`absolute top-2 bottom-2 rounded-md ${colors.bg} ${colors.border} border-2 cursor-move transition-all duration-200 hover:shadow-md group-hover:shadow-lg`}
              style={{
                left: position.left,
                width: position.width,
                opacity: draggedTask === task.id ? 0.7 : 1
              }}
              draggable
              onDragStart={() => handleTaskDragStart(task.id)}
              onDragEnd={handleTaskDragEnd}
            >
              <div className="p-2 h-full flex items-center justify-between text-white text-xs font-medium">
                <span className="truncate">{task.name}</span>
                <span>{task.progress}%</span>
              </div>
              
              {/* Progress bar */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-50 rounded-b-sm"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            
            {/* Dependencies */}
            {task.dependencies.map(depId => {
              const depTask = tasks.find(t => t.id === depId);
              if (!depTask) return null;
              
              const depPosition = calculateTaskPosition(depTask, timelineStart, timelineEnd, containerWidth);
              const startX = depPosition.left + depPosition.width;
              const endX = position.left;
              
              if (startX < endX) {
                return (
                  <svg
                    key={depId}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: containerWidth, height: '60px' }}
                  >
                    <defs>
                      <marker
                        id={`arrow-${task.id}-${depId}`}
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L0,6 L6,3 z" fill="#6b7280" />
                      </marker>
                    </defs>
                    <path
                      d={`M ${startX} 30 L ${endX} 30`}
                      stroke="#6b7280"
                      strokeWidth="2"
                      fill="none"
                      markerEnd={`url(#arrow-${task.id}-${depId})`}
                    />
                  </svg>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div ref={chartRef} className="min-h-96">
        {renderTimelineHeader()}
        <div className="divide-y divide-gray-100">
          {tasks.map(renderTaskRow)}
        </div>
        
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks to display</p>
            <p className="text-gray-400 text-sm">Add tasks to see the Gantt chart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;