import { Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Shell from './components/Shell';
import Account from './pages/Account';
import Capabilities from './pages/Capabilities';
import DomainPage from './pages/Domain';
import Domains from './pages/Domains';
import EventEdit from './pages/EventEdit';
import Events from './pages/Events';
import NotFound from './pages/NotFound';
import NoteEdit from './pages/NoteEdit';
import NoteView from './pages/NoteView';
import Notes from './pages/Notes';
import SignIn from './pages/SignIn';
import TodayPage from './pages/Today';

export default function App() {
  const { state } = useAuth();
  if (state.status === 'checking') return null;
  if (state.status === 'signed-out') return <SignIn />;
  return (
    <Shell user={state.user}>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/domains" element={<Domains />} />
        <Route path="/domains/:slug" element={<DomainPage />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/new" element={<NoteEdit />} />
        <Route path="/notes/:id" element={<NoteView />} />
        <Route path="/notes/:id/edit" element={<NoteEdit />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/new" element={<EventEdit />} />
        <Route path="/events/:id/edit" element={<EventEdit />} />
        <Route path="/capabilities" element={<Capabilities />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
