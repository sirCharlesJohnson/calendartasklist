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
  
  // Use Supabase hook for todos
  const { todos, loading, error, addTodo: addTodoToDb, updateTodo, deleteTodo: deleteTodoFromDb } = useTodos();

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

  const deleteTodo = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTodoFromDb(id);
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
          {/* Debug info - hidden on mobile */}
          <div className="hidden md:block mt-4 p-2 bg-gray-100 rounded text-sm">
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
                    onDelete={deleteTodo}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Unscheduled Tasks */}
          <DroppableUnscheduled
            todos={getUnscheduledTodos()}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />

          <DragOverlay>
            {activeTodo ? (
              <div className="bg-white rounded-lg shadow-xl border-2 border-blue-300 p-3 opacity-90">
                <span className="text-sm font-medium text-gray-800">{activeTodo.text}</span>
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
  onDelete
}: {
  day: Date;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
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
            onDelete={onDelete}
            targetDate={day}
          />
        ))}
      </SortableContext>
    </div>
  );
}

function SortableTask({ 
  todo, 
  onToggle, 
  onDelete,
  targetDate
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  targetDate: Date;
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
          className={`group bg-white rounded-lg border border-gray-200 p-0.5 md:p-3 hover:shadow-md transition-all ${
            isDragging ? 'opacity-50 shadow-lg' : ''
          } ${todo.completed ? 'opacity-60' : ''}`}
        >
      <div className="flex items-center space-x-0.5">
        {/* Hide checkbox on mobile, show on desktop */}
        <div onClick={(e) => e.stopPropagation()} className="hidden md:block">
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
        </div>
        {/* Delete button - always visible on mobile, hover on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(todo.id);
          }}
          className="opacity-0 md:group-hover:opacity-100 md:opacity-0 hover:opacity-100 transition-opacity duration-200 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="Delete task"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function UnscheduledTask({
  todo,
  onToggle,
  onDelete
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
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
      className={`group bg-white rounded-lg border border-gray-200 p-0.5 md:p-3 hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${todo.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center space-x-1">
        {/* Hide checkbox on mobile, show on desktop */}
        <div onClick={(e) => e.stopPropagation()} className="hidden md:block">
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
        </div>
        {/* Delete button - always visible on mobile, hover on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(todo.id);
          }}
          className="opacity-0 md:group-hover:opacity-100 md:opacity-0 hover:opacity-100 transition-opacity duration-200 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="Delete task"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DroppableUnscheduled({
  todos,
  onToggle,
  onDelete
}: {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
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
              onDelete={onDelete}
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
