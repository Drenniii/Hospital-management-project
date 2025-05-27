// =========================
// Importimi i Komponentëve
// =========================
import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/Terapisti/TableList.js";
import Typography from "views/User/Typography.js";
import Notifications from "views/Notifications.js";
import AdminDashboard from "views/Admin/AdminDashboard.js";

// ==========================================
// Merr rolin e përdoruesit nga localStorage
// ==========================================
const getUserRole = () => {
  const role = localStorage.getItem("userRole");
  console.log("Current user role:", role); // Debug log
  return role;
};

// ======================================
// Rreshtat që janë për të gjithë (common)
// ======================================
const commonRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/admin",
  },
];

// ========================
// Rreshtat për TERAPISTËT
// ========================
const therapistRoutes = [
  {
    path: "/table",
    name: "Table List",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/admin",
  },
];

// ========================
// Rreshtat për PËRDORUESIT
// ========================
const userRoutes = [
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-paper-2",
    component: Typography,
    layout: "/admin",
  },
];

// ====================
// Rreshtat për ADMINËT
// ====================
const adminRoutes = [
  {
    path: "/adminDashboard",
    name: "Admin Dashboard",
    icon: "nc-icon nc-settings-gear-65",
    component: AdminDashboard,
    layout: "/admin",
  },
];

// =====================================================
// Funksioni që kthen rreshtat sipas rolit të përdoruesit
// =====================================================
const getRoutesByRole = () => {
  const role = getUserRole();
  console.log("Getting routes for role:", role); // Debug log

  let routes;
  switch (role) {
    case "THERAPIST":
      routes = [...commonRoutes, ...therapistRoutes];
      break;
    case "USER":
      routes = [...commonRoutes, ...userRoutes];
      break;
    case "ADMIN":
      routes = [...commonRoutes, ...adminRoutes];
      break;
    default:
      routes = [...commonRoutes];
  }
  
  console.log("Returned routes:", routes); // Debug log
  return routes;
};

// ======================
// Eksportimi i rreshtave
// ======================
// Create a proxy object that returns fresh routes when accessed
const routesProxy = new Proxy([], {
  get: function(target, prop) {
    // When array methods are called, return them bound to the current routes
    const currentRoutes = getRoutesByRole();
    if (typeof currentRoutes[prop] === 'function') {
      return currentRoutes[prop].bind(currentRoutes);
    }
    return currentRoutes[prop];
  }
});

export default routesProxy;