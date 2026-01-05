import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CoderDashboard from './pages/dashboards/CoderDashboard'
import GestorDashboard from './pages/dashboards/GestorDashboard'
import AdministradorDashboard from './pages/dashboards/AdministradorDashboard'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RoleRoute allowedRoles={["CODER"]} />}>
            <Route path="/dashboard/coder" element={<CoderDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["GESTOR"]} />}>
            <Route path="/dashboard/gestor" element={<GestorDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["ADMINISTRADOR"]} />}>
            <Route path="/dashboard/admin" element={<AdministradorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Navigate to="/dashboard/coder" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
