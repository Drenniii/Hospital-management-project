import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom"; // ✅ useHistory for v5
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import routes from "routes.js";
import ApiService from "../../service/ApiService";  // ✅ Adjust path based on your folder structure
import DietPlans from "../DietPlans/DietPlans";
import Psychology from "../Psychology/Psychology";

function Header() {
  const location = useLocation();
  const history = useHistory(); // ✅ useHistory instead of useNavigate
  const [userRole, setUserRole] = useState("");
  const [showDietPlans, setShowDietPlans] = useState(false);
  const [showPsychology, setShowPsychology] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const handleLogout = async () => {
    console.log("Logout clicked");
    try {
      await ApiService.logoutUser();
      // Clear ALL localStorage data
      localStorage.clear();
      // Force reload the application to reset all states
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  const navigateTo = (path) => {
    history.push(path);
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : 'Profile';
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="mr-2"
          >
            {getBrandText()}
          </Navbar.Brand>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="nav mr-auto" navbar>
            <Nav.Item>
              <Nav.Link
                className="m-0"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <i className="nc-icon nc-chart-pie-35"></i>
                <span className="d-lg-none">Dashboard</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav className="ml-auto" navbar>
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                as={Nav.Link}
                className="m-0"
              >
                <i className="nc-icon nc-circle-09 mr-1"></i>
                <span>{capitalizeFirstLetter(userRole)}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigateTo("/admin/user")}>
                  <i className="nc-icon nc-single-02 mr-2"></i>My Profile
                </Dropdown.Item>
                
                {userRole === "ADMIN" && (
                  <>
                    <Dropdown.Item onClick={() => navigateTo("/admin/adminDashboard")}>
                      <i className="nc-icon nc-chart-pie-35 mr-2"></i>Dashboard
                    </Dropdown.Item>
                  </>
                )}

                {userRole === "THERAPIST" && (
                  <>
                    <Dropdown.Item onClick={() => navigateTo("/admin/appointments")}>
                      <i className="nc-icon nc-calendar-60 mr-2"></i>Appointments
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setShowPsychology(true)}>
                      <i className="nc-icon nc-sound-wave mr-2"></i>Psychology Resources
                    </Dropdown.Item>
                  </>
                )}

                {userRole === "NUTRICIST" && (
                  <>
                    <Dropdown.Item onClick={() => navigateTo("/admin/appointments")}>
                      <i className="nc-icon nc-calendar-60 mr-2"></i>Appointments
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setShowDietPlans(true)}>
                      <i className="nc-icon nc-paper-2 mr-2"></i>Diet Plans
                    </Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigateTo("/admin/settings")}>
                  <i className="nc-icon nc-settings-gear-65 mr-2"></i>Settings
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Item>
              <Nav.Link
                className="m-0"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                style={{ cursor: "pointer" }}
              >
                <span className="no-icon">Log out</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <DietPlans show={showDietPlans} onHide={() => setShowDietPlans(false)} />
      <Psychology show={showPsychology} onHide={() => setShowPsychology(false)} />
    </Navbar>
  );
}

export default Header;
