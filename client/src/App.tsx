import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import EconomicDashboard from './pages/EconomicDashboard';
import CBTLibrary from './pages/CBTLibrary';
import Community from './pages/Community';
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
          <Route path="/log" element={<Log />} />
          <Route path="/economic" element={<EconomicDashboard />} />
          <Route path="/cbt" element={<CBTLibrary />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
