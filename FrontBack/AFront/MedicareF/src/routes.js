/*!
=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================
* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/Terapisti/TableList.js";
import Typography from "views/User/Typography.js";
import Notifications from "views/Notifications.js";
import AdminDashboard from "views/Admin/AdminDashboard.js"; // ✅ Importo komponentin e ri

// Merr rolin nga localStorage
const getUserRole = () => {
  return localStorage.getItem("userRole"); // Shembull: "admin", "terapist", "user"
};

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin"
  },
  {
    path: "/table",
    name: "Table List",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/admin"
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-paper-2",
    component: Typography,
    layout: "/admin",
    role: "NON-THERAPIST"
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/admin"
  },
  {
    path: "/adminDashboard",
    name: "Admin Dashboard",
    icon: "nc-icon nc-settings-gear-65",
    component: AdminDashboard,
    layout: "/admin",
    role: "ADMIN"
  }
];

export default dashboardRoutes;
