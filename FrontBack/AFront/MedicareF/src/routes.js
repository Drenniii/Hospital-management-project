// =========================
// Importimi i Komponentëve
// =========================
import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/Terapisti/TableList.js";
import Typography from "views/User/Typography.js";
import Notifications from "views/Notifications.js";
import AdminDashboard from "views/Admin/AdminDashboard.js";
import UserDashboard from "views/User/UserDashboard.js";
import TherapistSelection from "views/User/TherapistSelection.js";
import NutritionistSelection from "views/User/NutritionistSelection.js";
import Appointments from "views/Appointments.js";
import Settings from "views/Settings.js";

// ==========================================
// Merr rolin e përdoruesit nga localStorage
// ==========================================
const getUserRole = () => {
  const role = localStorage.getItem("userRole");
  console.log("Current user role:", role);
  return role;
};

// ======================================
// Rreshtat që janë për të gjithë (common)
// ======================================
const commonRoutes = [
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/appointments",
    name: "Appointments",
    icon: "nc-icon nc-watch-time",
    component: Appointments,
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

// ======================================
// Rreshtat që janë të fshehur (hidden)
// ======================================
const hiddenRoutes = [
  {
    path: "/settings",
    name: "Settings",
    icon: "nc-icon nc-settings-gear-65",
    component: Settings,
    layout: "/admin",
    hidden: true,
  },
  {
    path: "/therapist-selection",
    component: TherapistSelection,
    layout: "/admin",
    hidden: true,
  },
  {
    path: "/nutritionist-selection",
    component: NutritionistSelection,
    layout: "/admin",
    hidden: true,
  },
];

// ========================
// Rreshtat për TERAPISTËT
// ========================
const therapistRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
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
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: UserDashboard,
    layout: "/admin",
  },
];

// ====================
// Rreshtat për ADMINËT
// ====================
const adminRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/adminDashboard",
    name: "Admin Dashboard",
    icon: "nc-icon nc-settings-gear-65",
    component: AdminDashboard,
    layout: "/admin",
  },
];

// ====================
// Rreshtat për NUTRICIONISTËT
// ====================
const nutritionistRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
];

// =====================================================
// Funksioni që kthen rreshtat sipas rolit të përdoruesit
// =====================================================
const getRoutesByRole = () => {
  const role = getUserRole();
  console.log("Getting routes for role:", role);

  let routes;
  switch (role) {
    case "THERAPIST":
      routes = [...commonRoutes, ...therapistRoutes, ...hiddenRoutes];
      break;
    case "USER":
      routes = [...commonRoutes, ...userRoutes, ...hiddenRoutes];
      break;
    case "ADMIN":
      routes = [...commonRoutes, ...adminRoutes, ...hiddenRoutes];
      break;
    case "NUTRITIONIST":
      routes = [...commonRoutes, ...nutritionistRoutes, ...hiddenRoutes];
      break;
    default:
      routes = [...commonRoutes, ...hiddenRoutes];
  }

  console.log("Returned routes:", routes);
  return routes;
};

// ======================
// Eksportimi i rreshtave
// ======================
// Kthen rreshtat e freskët çdo herë që aksesohen
const routesProxy = new Proxy([], {
  get: function (target, prop) {
    const currentRoutes = getRoutesByRole();
    if (typeof currentRoutes[prop] === "function") {
      return currentRoutes[prop].bind(currentRoutes);
    }
    return currentRoutes[prop];
  },
});

export default routesProxy;
