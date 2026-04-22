import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import ManageMembers from './pages/ManageMembers';
import ManageMenu from './pages/ManageMenu';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import migration utility (exposes window.migrateToSupabase)
import './utils/migrateToSupabase';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/event/:eventId/edit" element={<EditEvent />} />
          <Route path="/event/new" element={<CreateEvent />} />
          <Route path="/members" element={<ManageMembers />} />
          <Route path="/menu" element={<ManageMenu />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
