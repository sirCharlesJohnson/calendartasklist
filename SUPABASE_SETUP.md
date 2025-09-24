# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `todo-calendar-app`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon public key

## 3. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## 4. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-setup.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the script

This will create:
- `todos` table with all necessary columns
- Automatic `updated_at` timestamp trigger
- Row Level Security policies
- Sample data (optional)

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Open `http://localhost:3000`
3. Try adding a todo - it should now be saved to Supabase!
4. Check your Supabase dashboard > Table Editor > todos to see the data

## Features Included

✅ **Real-time sync** - Changes appear instantly across all clients
✅ **Persistent storage** - Todos survive page refreshes
✅ **Error handling** - Graceful error states
✅ **Loading states** - Smooth user experience
✅ **Type safety** - Full TypeScript support

## Next Steps (Optional)

- Add user authentication
- Implement user-specific todos
- Add data validation
- Set up proper RLS policies
- Add data backup/export features

