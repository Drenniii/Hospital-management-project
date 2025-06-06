import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  const [openTypography, setOpenTypography] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      setRole(user.role.toUpperCase());
    }
  }, []);

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div
        className="sidebar-background"
        style={{ backgroundImage: "url(" + image + ")" }}
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          {/* <a
            href="https://www.creative-tim.com?ref=lbd-sidebar"
            className="simple-text logo-mini mx-1"
          >
            <div className="logo-img">
              <img src={require("assets/img/reactlogo.png")} alt="..." />
            </div>
          </a> */}
          <a className="simple-text" href="#">
            Medicare+
          </a>
        </div>
        <Nav>
          {routes
            .filter(route => !route.redirect && !route.hidden)
            .map((prop, key) => {
              if (prop.name === "Typography") {
                return (
                  <li className="nav-item" key={key}>
                    <div
                      className="nav-link"
                      onClick={() => setOpenTypography(!openTypography)}
                      style={{ cursor: "pointer" }}
                    >
                      <i className={prop.icon} />
                      <p>
                        {prop.name}
                        <b className="caret"></b>
                      </p>
                    </div>
                    {openTypography && (
                      <ul className="nav flex-column ml-3">
                        <li className="nav-item">
                          <NavLink
                            to="/admin/terapisti"
                            className="nav-link"
                            activeClassName="active"
                          >
                            Shiko Terapistët
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            to="/admin/nutricisti"
                            className="nav-link"
                            activeClassName="active"
                          >
                            Shiko Nutricistët
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                );
              } else {
                return (
                  <li className={activeRoute(prop.layout + prop.path)} key={key}>
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              }
            })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
