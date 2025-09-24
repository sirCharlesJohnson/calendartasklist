'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Checkbox from '../components/checkbox';
import { useTodos, Todo } from '../hooks/useTodos';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [newTodo, setNewTodo] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  
  // Use Supabase hook for todos
  const { todos, loading, error, addTodo: addTodoToDb, updateTodo } = useTodos();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    // Normalize to start of day to avoid timezone issues
    startOfWeek.setHours(0, 0, 0, 0);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      day.setHours(0, 0, 0, 0); // Normalize to start of day
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const todoDate = taskDate ? new Date(taskDate + 'T00:00:00') : null; // null for unscheduled
      const todo: Omit<Todo, 'id'> = {
        text: newTodo.trim(),
        completed: false,
        date: todoDate,
        priority: 'medium'
      };
      await addTodoToDb(todo);
      setNewTodo('');
      setTaskDate('');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  const updatePriority = async (id: string, priority: 'high' | 'medium' | 'low') => {
    await updateTodo(id, { priority });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-yellow-800';
      case 'low': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  const getTodosForDay = (date: Date) => {
    return todos.filter(todo => 
      todo.date && todo.date.toDateString() === date.toDateString()
    );
  };

  const getUnscheduledTodos = () => {
    return todos.filter(todo => todo.date === null);
  };

  const moveTodo = async (todoId: string, newDate: Date | null) => {
    await updateTodo(todoId, { date: newDate });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const todoId = active.id as string;
      const targetDate = over.data.current?.date;
      if (targetDate !== undefined) {
        moveTodo(todoId, targetDate);
      }
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = getWeekDays(currentWeek);
  const activeTodo = activeId ? todos.find(todo => todo.id === activeId) : null;

  // Close priority dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (editingPriority && !target.closest('[data-priority-dropdown]')) {
        setEditingPriority(null);
      }
    };
    
    if (editingPriority) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [editingPriority]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your todos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2 md:py-8">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="text-center mb-3 md:mb-8">
          <h1 className="text-xl md:text-5xl font-extrabold text-gray-900 mb-2 md:mb-2">
            Todo Calendar App
          </h1>
          <p className="text-sm md:text-base text-gray-600">Drag and drop tasks to reschedule them</p>
          {!isSupabaseConfigured && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
              <strong>⚠️ Supabase Not Configured:</strong> Please set up your Supabase credentials in <code>.env.local</code> to enable data persistence. 
              <a href="/setup" className="underline ml-1">View setup instructions</a>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}
        </div>

        {/* Task Input */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-6 mb-3 md:mb-8">
          <h2 className="text-base md:text-2xl font-semibold text-gray-800 mb-3 md:mb-6">Add New Task</h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              aria-label="Task due date"
            />
            <button
              onClick={addTodo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:py-3 md:px-8 rounded-lg transition-colors text-sm md:text-lg"
            >
              Add Task
            </button>
          </div>
          {/* Debug info */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
            <div>Editing Priority: {editingPriority || 'None'}</div>
            <div>Total Todos: {todos.length}</div>
            <div>Unscheduled: {getUnscheduledTodos().length}</div>
          </div>
        </div>

        {/* Drag and Drop Context - Wraps both Calendar and Unscheduled */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Weekly Calendar */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Week Navigation */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 md:px-6 md:py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="text-white hover:bg-white/20 p-1 md:p-2 rounded-lg transition-colors"
                  aria-label="Previous week"
                >
                  <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-sm md:text-xl font-semibold text-white text-center">
                  {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h2>
                
                <button
                  onClick={() => navigateWeek('next')}
                  className="text-white hover:bg-white/20 p-1 md:p-2 rounded-lg transition-colors"
                  aria-label="Next week"
                >
                  <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 min-h-[150px] md:min-h-[600px]">
              {weekDays.map((day, index) => (
                <div
                  key={day.toISOString()}
                  className={`border-r border-gray-200 p-1 md:p-4 ${
                    index === 6 ? 'border-r-0' : ''
                  } ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="text-center mb-1 md:mb-4">
                    <div className="text-xs font-medium text-gray-500">
                      {dayNames[day.getDay()]}
                    </div>
                    <div className={`text-sm md:text-2xl font-bold ${
                      isToday(day) ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Tasks for this day */}
                  <DroppableDay
                    day={day}
                    todos={getTodosForDay(day)}
                    onToggle={toggleTodo}
                    onUpdatePriority={updatePriority}
                    getPriorityColor={getPriorityColor}
                    getPriorityTextColor={getPriorityTextColor}
                    editingPriority={editingPriority}
                    setEditingPriority={setEditingPriority}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Unscheduled Tasks */}
          <DroppableUnscheduled
            todos={getUnscheduledTodos()}
            onToggle={toggleTodo}
            onUpdatePriority={updatePriority}
            getPriorityColor={getPriorityColor}
            getPriorityTextColor={getPriorityTextColor}
            editingPriority={editingPriority}
            setEditingPriority={setEditingPriority}
          />

          <DragOverlay>
            {activeTodo ? (
              <div className="bg-white rounded-lg shadow-xl border-2 border-blue-300 p-3 opacity-90">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(activeTodo.priority)}`}></div>
                  <span className="text-sm font-medium text-gray-800">{activeTodo.text}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

function DroppableDay({
  day,
  todos,
  onToggle,
  onUpdatePriority,
  getPriorityColor,
  getPriorityTextColor,
  editingPriority,
  setEditingPriority
}: {
  day: Date;
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  getPriorityTextColor: (priority: 'high' | 'medium' | 'low') => string;
  editingPriority: string | null;
  setEditingPriority: (id: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toDateString()}`,
    data: {
      date: day
    }
  });

  return (
        <div 
          ref={setNodeRef}
          className={`space-y-1 min-h-[100px] md:min-h-[400px] p-1 rounded-lg transition-colors ${
            isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
          }`}
        >
      <SortableContext
        items={todos.map(todo => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        {todos.map(todo => (
          <SortableTask
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onUpdatePriority={onUpdatePriority}
            getPriorityColor={getPriorityColor}
            getPriorityTextColor={getPriorityTextColor}
            targetDate={day}
            editingPriority={editingPriority}
            setEditingPriority={setEditingPriority}
          />
        ))}
      </SortableContext>
    </div>
  );
}

function SortableTask({ 
  todo, 
  onToggle, 
  onUpdatePriority, 
  getPriorityColor, 
  getPriorityTextColor,
  targetDate,
  editingPriority,
  setEditingPriority
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  getPriorityTextColor: (priority: 'high' | 'medium' | 'low') => string;
  targetDate: Date;
  editingPriority: string | null;
  setEditingPriority: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: todo.id,
    data: {
      date: targetDate.toDateString()
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
        <div
          ref={setNodeRef}
          style={style}
          className={`bg-white rounded-lg border border-gray-200 p-0.5 md:p-3 hover:shadow-md transition-all ${
            isDragging ? 'opacity-50 shadow-lg' : ''
          } ${todo.completed ? 'opacity-60' : ''}`}
        >
      <div className="flex items-center space-x-0.5">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-0 h-2 w-2"
          />
        </div>
        <div className="flex-1 min-w-0 max-w-full">
            <div 
              {...attributes}
              {...listeners}
              className={`text-xs font-normal cursor-move truncate ${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            >
              {todo.text}
            </div>
            <div className="flex items-center justify-between mt-0 w-full">
            <PriorityButton
              todo={todo}
              editingPriority={editingPriority}
              setEditingPriority={setEditingPriority}
              onUpdatePriority={onUpdatePriority}
              getPriorityColor={getPriorityColor}
              getPriorityTextColor={getPriorityTextColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UnscheduledTask({
  todo,
  onToggle,
  onUpdatePriority,
  getPriorityColor,
  getPriorityTextColor,
  editingPriority,
  setEditingPriority
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  getPriorityTextColor: (priority: 'high' | 'medium' | 'low') => string;
  editingPriority: string | null;
  setEditingPriority: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: todo.id,
    data: {
      date: 'unscheduled'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-0.5 md:p-3 hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${todo.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center space-x-1">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-0"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div 
            {...attributes}
            {...listeners}
            className={`text-xs font-medium cursor-move ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}
          >
            {todo.text}
          </div>
          <div className="flex items-center justify-between mt-0">
            <PriorityButton
              todo={todo}
              editingPriority={editingPriority}
              setEditingPriority={setEditingPriority}
              onUpdatePriority={onUpdatePriority}
              getPriorityColor={getPriorityColor}
              getPriorityTextColor={getPriorityTextColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableUnscheduled({
  todos,
  onToggle,
  onUpdatePriority,
  getPriorityColor,
  getPriorityTextColor,
  editingPriority,
  setEditingPriority
}: {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  getPriorityTextColor: (priority: 'high' | 'medium' | 'low') => string;
  editingPriority: string | null;
  setEditingPriority: (id: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unscheduled',
    data: {
      date: null // null means unscheduled
    }
  });

  return (
        <div className="bg-white rounded-xl shadow-lg p-2 md:p-6 mt-2 md:mt-8">
          <h2 className="text-sm md:text-2xl font-semibold text-gray-800 mb-2 md:mb-6">Unscheduled Tasks (Drag to Schedule)</h2>
          <div 
            ref={setNodeRef}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-4 min-h-[80px] md:min-h-[200px] p-1 md:p-4 rounded-lg transition-colors ${
              isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
            }`}
          >
        <SortableContext
          items={todos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map(todo => (
            <UnscheduledTask
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onUpdatePriority={onUpdatePriority}
              getPriorityColor={getPriorityColor}
              getPriorityTextColor={getPriorityTextColor}
              editingPriority={editingPriority}
              setEditingPriority={setEditingPriority}
            />
          ))}
        </SortableContext>
        {todos.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No unscheduled tasks. Add a task above to get started!
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityButton({
  todo,
  editingPriority,
  setEditingPriority,
  onUpdatePriority,
  getPriorityColor,
  getPriorityTextColor
}: {
  todo: Todo;
  editingPriority: string | null;
  setEditingPriority: (id: string | null) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string;
  getPriorityTextColor: (priority: 'high' | 'medium' | 'low') => string;
}) {
  return (
    <div className="relative" data-priority-dropdown>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Priority button clicked for todo:', todo.id, 'Current editingPriority:', editingPriority);
          setEditingPriority(editingPriority === todo.id ? null : todo.id);
        }}
        className={`flex items-center space-x-0.5 px-0.5 py-0.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm cursor-pointer ${getPriorityTextColor(todo.priority)} bg-opacity-20 border-current max-w-fit`}
        style={{ pointerEvents: 'auto', zIndex: 1000, position: 'relative' }}
      >
        <div className={`w-0.5 h-0.5 rounded-full ${getPriorityColor(todo.priority)}`}></div>
        <span className="capitalize text-xs">{todo.priority === 'high' ? 'H' : todo.priority === 'medium' ? 'M' : 'L'}</span>
        <svg className="w-0.5 h-0.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {editingPriority === todo.id && (
        <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[120px]" style={{ display: 'block' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdatePriority(todo.id, 'high');
              setEditingPriority(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-700 flex items-center space-x-2 rounded-t-lg"
          >
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>High</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdatePriority(todo.id, 'medium');
              setEditingPriority(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-50 text-yellow-700 flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Medium</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdatePriority(todo.id, 'low');
              setEditingPriority(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 text-green-700 flex items-center space-x-2 rounded-b-lg"
          >
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Low</span>
          </button>
        </div>
      )}
    </div>
  );
}