import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/hooks/useAuth";
import HomePage from "@/react-app/pages/Home";
import DashboardPage from "@/react-app/pages/Dashboard";
import TicketDetailPage from "@/react-app/pages/TicketDetail";
import CreateTicketPage from "@/react-app/pages/CreateTicket";
import AdminPage from "@/react-app/pages/Admin";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/ticket/:id" element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/create-ticket" element={
            <ProtectedRoute>
              <CreateTicketPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="administracija">
              <AdminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
