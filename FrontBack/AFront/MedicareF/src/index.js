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

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// Importo Bootstrap CSS dhe JS
import "bootstrap/dist/css/bootstrap.min.css";  // CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js";  // JavaScript (opsional, për dropdowns, modals etj.)

import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Komponentët
import AdminLayout from "layouts/Admin.js";
import LandingPage from "views/LandingPage";
import SignUp from "views/SignUp";
import Login from "views/Login";
import ForgotPassword from "views/ForgotPassword";
import AdminDashboard from "views/Admin/AdminDashboard"; // ✅ Importo AdminDashboard

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Switch>
      <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
      <Route path="/home" component={LandingPage} />
      <Route path="/signUp" component={SignUp} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/adminDashboard" component={AdminDashboard} /> {/* ✅ Rruga Për AdminDashboard  */}
      <Redirect exact from="/" to="/home" />
    </Switch>
  </BrowserRouter>
);
