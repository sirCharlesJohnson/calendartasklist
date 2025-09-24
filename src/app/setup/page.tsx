export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Supabase Setup Instructions</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">🚀 Quick Start</h2>
              <p className="text-blue-800">Follow these steps to enable data persistence in your Todo Calendar App.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">1. Create a Supabase Project</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Sign up or log in to your account</li>
                <li>Click &quot;New Project&quot;</li>
                <li>Choose your organization</li>
                <li>Enter project details:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Name: <code className="bg-gray-100 px-2 py-1 rounded">todo-calendar-app</code></li>
                    <li>Database Password: Choose a strong password</li>
                    <li>Region: Select the region closest to you</li>
                  </ul>
                </li>
                <li>Click &quot;Create new project&quot;</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">2. Get Your Project Credentials</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>In your Supabase dashboard, go to <strong>Settings → API</strong></li>
                <li>Copy the following values:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong>Project URL</strong> (looks like: <code className="bg-gray-100 px-2 py-1 rounded">https://xyz.supabase.co</code>)</li>
                    <li><strong>Anon public key</strong> (long string starting with <code className="bg-gray-100 px-2 py-1 rounded">eyJ...</code>)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">3. Update Environment Variables</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Open <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> in your project root</li>
                <li>Replace the placeholder values with your actual credentials:
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 font-mono text-sm">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here</div>
                  </div>
                </li>
                <li>Save the file</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">4. Set Up Database Tables</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>In your Supabase dashboard, go to <strong>SQL Editor</strong></li>
                <li>Click &quot;New query&quot;</li>
                <li>Copy and paste the following SQL script:
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 font-mono text-sm overflow-x-auto">
                    <div>-- Create todos table</div>
                    <div>CREATE TABLE IF NOT EXISTS todos (</div>
                    <div>  id TEXT PRIMARY KEY,</div>
                    <div>  text TEXT NOT NULL,</div>
                    <div>  completed BOOLEAN DEFAULT FALSE,</div>
                    <div>  date DATE,</div>
                    <div>  priority TEXT CHECK (priority IN (&apos;high&apos;, &apos;medium&apos;, &apos;low&apos;)) DEFAULT &apos;medium&apos;,</div>
                    <div>  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),</div>
                    <div>  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                    <div>);</div>
                    <div></div>
                    <div>-- Enable Row Level Security</div>
                    <div>ALTER TABLE todos ENABLE ROW LEVEL SECURITY;</div>
                    <div></div>
                    <div>-- Create policy to allow all operations</div>
                    <div>CREATE POLICY &quot;Allow all operations on todos&quot; ON todos</div>
                    <div>  FOR ALL USING (true);</div>
                  </div>
                </li>
                <li>Click &quot;Run&quot; to execute the script</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">5. Test the Integration</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Restart your development server: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
                <li>Go to <a href="http://localhost:3001" className="text-blue-600 hover:underline">http://localhost:3001</a></li>
                <li>Try adding a todo - it should now be saved to Supabase!</li>
                <li>Check your Supabase dashboard → Table Editor → todos to see the data</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-900 mb-2">✅ You&apos;re All Set!</h2>
              <p className="text-green-800">Once configured, your Todo Calendar App will have:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-green-700">
                <li>Real-time sync across all clients</li>
                <li>Persistent storage that survives page refreshes</li>
                <li>Error handling and loading states</li>
                <li>Full TypeScript support</li>
              </ul>
            </div>

            <div className="text-center">
              <a 
                href="http://localhost:3001" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                ← Back to Todo Calendar App
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}