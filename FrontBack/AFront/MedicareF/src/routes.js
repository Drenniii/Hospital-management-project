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
import Chat from "components/Chat/Chat.js";
import Account from "views/Account.js";
import Payments from "views/Admin/Payments.js";
import MyReviews from "views/MyReviews.js";
import ProfessionalReviews from "views/ProfessionalReviews.js";

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
const commonRoutes = [];

// ======================================
// Chat route for non-admin users
// ======================================
const chatRoute = [
  {
    path: "/chat",
    name: "Messages",
    icon: "nc-icon nc-chat-round",
    component: Chat,
    layout: "/admin",
  },
];

// Add reviews route only for regular users
const userReviewsRoute = {
  path: "/my-reviews",
  name: "My Reviews",
  icon: "nc-icon nc-paper-2",
  component: MyReviews,
  layout: "/admin",
};

// ======================================
// Rreshtat për appointments (non-admin)
// ======================================
const appointmentRoutes = [
  {
    path: "/appointments",
    name: "Appointments",
    icon: "nc-icon nc-watch-time",
    component: Appointments,
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
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/professional-reviews",
    name: "Patient Reviews",
    icon: "nc-icon nc-favourite-28",
    component: ProfessionalReviews,
    layout: "/admin",
  }
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
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/account",
    name: "Account",
    icon: "nc-icon nc-credit-card",
    component: Account,
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
    icon: "nc-icon nc-grid-45",
    component: AdminDashboard,
    layout: "/admin",
  },
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
    path: "/payments",
    name: "Payments",
    icon: "nc-icon nc-money-coins",
    component: Payments,
    layout: "/admin",
  },
];

// ============================
// Rreshtat për NUTRICIONISTËT
// ============================
const nutritionistRoutes = [
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
    path: "/professional-reviews",
    name: "Patient Reviews",
    icon: "nc-icon nc-favourite-28",
    component: ProfessionalReviews,
    layout: "/admin",
  }
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
      routes = [...therapistRoutes, ...chatRoute, ...appointmentRoutes, ...hiddenRoutes];
      break;
    case "USER":
      routes = [...userRoutes, ...chatRoute, ...appointmentRoutes, userReviewsRoute, ...hiddenRoutes];
      break;
    case "ADMIN":
      routes = [...adminRoutes, ...hiddenRoutes];
      break;
    case "NUTRICIST":
      routes = [...nutritionistRoutes, ...chatRoute, ...appointmentRoutes, ...hiddenRoutes];
      break;
    default:
      routes = [...hiddenRoutes];
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