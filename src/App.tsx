import React, { useState, useEffect } from 'react';
import { Plus, Calendar, List, BarChart3 } from 'lucide-react';
import { Task, TaskFormData } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import ExportButton from './components/ExportButton';
import { getDateRange, calculateDuration } from './utils/dateUtils';
import { validateTaskDependencies } from './utils/ganttUtils';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'gantt' | 'list'>('gantt');
  const [dependencyErrors, setDependencyErrors] = useState<string[]>([]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('pm-planner-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('pm-planner-tasks', JSON.stringify(tasks));
    setDependencyErrors(validateTaskDependencies(tasks));
  }, [tasks]);

  const handleTaskSubmit = (taskData: TaskFormData) => {
    const startDate = new Date(taskData.startDate);
    const endDate = new Date(taskData.endDate);
    
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? {
              ...task,
              ...taskData,
              startDate,
              endDate,
              duration: calculateDuration(startDate, endDate)
            }
          : task
      ));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now().toString(),
        name: taskData.name,
        startDate,
        endDate,
        duration: calculateDuration(startDate, endDate),
        progress: 0,
        category: taskData.category,
        dependencies: taskData.dependencies,
        description: taskData.description,
        assignee: taskData.assignee
      };
      setTasks(prev => [...prev, newTask]);
    }
    
    setShowTaskForm(false);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      // Remove this task from dependencies of other tasks
      setTasks(prev => prev.map(task => ({
        ...task,
        dependencies: task.dependencies.filter(depId => depId !== taskId)
      })));
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleProgressUpdate = (taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress } : task
    ));
  };

  const handleExport = () => {
    // This function will be called after successful PDF export
    console.log('PDF exported successfully');
  };

  const { start: timelineStart, end: timelineEnd } = getDateRange(tasks);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.progress === 100).length,
    inProgress: tasks.filter(task => task.progress > 0 && task.progress < 100).length,
    notStarted: tasks.filter(task => task.progress === 0).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="text-blue-600" size={28} />
              <h1 className="text-xl font-semibold text-gray-900">PM Planner</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('gantt')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'gantt'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar size={16} className="inline mr-1" />
                  Gantt
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={16} className="inline mr-1" />
                  List
                </button>
              </div>
              
              {tasks.length > 0 && <ExportButton onExport={handleExport} />}
              
              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <div className="w-5 h-5 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <div className="w-5 h-5 bg-amber-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dependency Errors */}
        {dependencyErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Dependency Issues:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {dependencyErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content */}
        <div className="gantt-chart-container">
          {activeView === 'gantt' ? (
            <GanttChart
              tasks={tasks}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              onTaskUpdate={handleTaskUpdate}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TaskList
                tasks={tasks}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
                onProgressUpdate={handleProgressUpdate}
              />
            </div>
          )}
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          existingTasks={tasks}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}

export default App;