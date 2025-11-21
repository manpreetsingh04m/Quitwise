import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
// Import other pages as we create them, or use placeholders for now to avoid errors if they don't exist yet.
// Actually, I should create them first or just import them and let the build fail if I don't create them immediately?
// Better to create placeholders or create them in this turn.

// I'll create placeholders for now in the same file or just assume I'll create them in the next steps.
// To be safe, I'll create simple placeholders for the other pages right now in this tool call sequence.

import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Tokens from './pages/Tokens';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
