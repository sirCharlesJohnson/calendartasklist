-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to todos table
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now - you can make this more restrictive later)
CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO todos (id, text, completed, date, priority) VALUES
  ('1', 'Sample task 1', false, '2024-01-15', 'high'),
  ('2', 'Sample task 2', true, null, 'medium'),
  ('3', 'Sample task 3', false, '2024-01-16', 'low')
ON CONFLICT (id) DO NOTHING;

