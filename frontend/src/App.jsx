import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuthUser } from './hooks/useAuthUser';
import { hasPermission, ROLES } from './utils/roleUtils';
import { Toaster } from 'sonner';

// Lazy load page components for better performance (React Best Practice)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Leaves = lazy(() => import('./pages/Leaves'));
const SignInPage = lazy(() => import('./components/auth/SignInPage'));
const SignUpPage = lazy(() => import('./components/auth/SignUpPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));

// Admin pages
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCompanies = lazy(() => import('./pages/admin/Companies'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminDemoRequests = lazy(() => import('./pages/admin/DemoRequests'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Reusable animated loading fallback
const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireInitializedWorkspace = false }) => {
  const { isLoaded, isAuthenticated, workspaceInitialized, userRole } = useAuthUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole === "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (requireInitializedWorkspace && !workspaceInitialized) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Role Protected Route Wrapper
const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isLoaded, userRole } = useAuthUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!hasPermission(userRole, requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Super Admin Route Wrapper
const SuperAdminRoute = ({ children }) => {
  const { isLoaded, isAuthenticated, userRole } = useAuthUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const EntryRoute = () => {
  const { isLoaded, isAuthenticated, workspaceInitialized, userRole } = useAuthUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (userRole === "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to={workspaceInitialized ? "/dashboard" : "/onboarding"} replace />;
};

const OnboardingRoute = () => {
  const { isLoaded, isAuthenticated, workspaceInitialized, userRole } = useAuthUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole === "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (workspaceInitialized) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Onboarding />;
};

function App() {
  const { getToken } = useAuth();

  // Sync the Clerk JWT token getter with our global Axios instance
  useEffect(() => {
    import('./services/api').then(module => {
      module.setApiTokenGetter(getToken);
    });
  }, [getToken]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes for Authentication */}
          <Route path="/" element={<EntryRoute />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Onboarding Route (Protected, standalone layout) */}
          <Route path="/onboarding" element={<OnboardingRoute />} />
          
          {/* Public Legal Routes */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/product-details" element={<ProductDetails />} />

          {/* Protected Dashboard Routes */}
          <Route 
            element={
              <ProtectedRoute requireInitializedWorkspace>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={
              <RoleProtectedRoute requiredRole={ROLES.EMPLOYEE}>
                <Employees />
              </RoleProtectedRoute>
            } />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/leave" element={<Navigate to="/leaves" replace />} />
            <Route path="/settings" element={
              <RoleProtectedRoute requiredRole={ROLES.EMPLOYEE}>
                <Settings />
              </RoleProtectedRoute>
            } />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Super Admin Protected Routes */}
          <Route
            element={
              <SuperAdminRoute>
                <AdminLayout />
              </SuperAdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/demo-requests" element={<AdminDemoRequests />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
