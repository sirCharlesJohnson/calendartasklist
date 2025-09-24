import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface Todo {
  id: string
  text: string
  completed: boolean
  date: Date | null
  time: string | null
  priority: 'high' | 'medium' | 'low'
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert database row to Todo
  const dbRowToTodo = (row: Record<string, unknown>): Todo => ({
    id: String(row.id),
    text: String(row.text),
    completed: Boolean(row.completed),
    date: row.date ? new Date(String(row.date) + 'T00:00:00') : null, // Fix timezone issue
    time: row.time ? String(row.time) : null,
    priority: (String(row.priority || 'medium') as 'high' | 'medium' | 'low')
  })

  // Convert Todo to database row
  const todoToDbRow = (todo: Todo) => ({
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    date: todo.date ? todo.date.toISOString().split('T')[0] : null,
    time: todo.time,
    priority: todo.priority
  })

  // Fetch todos from Supabase
  const fetchTodos = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Supabase not configured. Please set up your credentials.')
      return
    }

    try {
      setLoading(true)
      console.log('Attempting to fetch todos from Supabase...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setTodos(data.map(dbRowToTodo))
      setError(null)
    } catch (err) {
      console.error('Error fetching todos:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch todos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Add a new todo
  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Please set up your credentials.')
      return
    }

    try {
      const newTodo = {
        ...todo,
        id: Date.now().toString()
      }

      const { error } = await supabase
        .from('todos')
        .insert(todoToDbRow(newTodo))

      if (error) throw error

      setTodos(prev => [...prev, newTodo])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo')
      console.error('Error adding todo:', err)
    }
  }

  // Update a todo
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Please set up your credentials.')
      return
    }

    try {
      const existingTodo = todos.find(t => t.id === id)
      if (!existingTodo) {
        throw new Error('Todo not found')
      }
      
      const updatedTodo = { ...existingTodo, ...updates }
      const { error } = await supabase
        .from('todos')
        .update(todoToDbRow(updatedTodo))
        .eq('id', id)

      if (error) throw error

      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      console.error('Error updating todo:', err)
    }
  }

  // Delete a todo
  const deleteTodo = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Please set up your credentials.')
      return
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      console.error('Error deleting todo:', err)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchTodos()

    const channel = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos'
        },
        () => {
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTodos])

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos
  }
}
