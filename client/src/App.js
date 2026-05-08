import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Public Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProvSignup from "./pages/ProvSignup";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import UniversalSearchPage from "./pages/UniversalSearchPage";
import ProviderDetail from "./pages/ProviderDetail";
import Profile from "./pages/Profile";
import About from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import FAQs from "./pages/FAQs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Safety from "./pages/Safety";

// Protected Pages
import UserDashboard from "./pages/UserDashboard";
import ProvDashboard from "./pages/ProvDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderDetailAdmin from "./components/admin/ProviderDetailAdmin";

// Components
import RoleRoute from "./components/RoleRoute";
import Header from "./components/Navbar";
import Footer from "./components/Footer";

// Layouts
function HomeLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Admin Layout (you can add Admin Navbar later here)
function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* You can add Admin Sidebar / Top Nav here later */}
      <main className="p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ====================== PUBLIC ROUTES (with Header + Footer) ====================== */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/safety" element={<Safety />} />
        </Route>

        <Route path="/search" element={<SearchPage />} />
        <Route path="/unisearch" element={<UniversalSearchPage />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />

        {/* ====================== AUTH ROUTES (No Header/Footer) ====================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/provider/register" element={<ProvSignup />} />

        {/* ====================== PROTECTED USER ROUTES ====================== */}
        <Route
  path="/user/profile"
  element={
    <RoleRoute allowed={["user"]}>
      <UserDashboard />
    </RoleRoute>
  }
/>

        <Route
          path="/user/dashboard"
          element={
            <RoleRoute allowed={["user"]}>
              <UserDashboard />
            </RoleRoute>
          }
        />

        {/* ====================== PROTECTED PROVIDER ROUTES ====================== */}
        <Route
          path="/provider/dashboard"
          element={
            <RoleRoute allowed={["provider"]}>
              <ProvDashboard />
            </RoleRoute>
          }
        />

        {/* ====================== PROTECTED ADMIN ROUTES (Nested) ====================== */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowed={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="provider/:id" element={<ProviderDetailAdmin />} />
          
          {/* Add more admin routes here easily in future */}
          {/* <Route path="providers" element={<ProvidersList />} /> */}
          {/* <Route path="users" element={<UsersList />} /> */}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<div className="text-center py-20">404 - Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}