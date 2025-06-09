import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

function Sidebar({ color, image, routes }) {
  const [openTypography, setOpenTypography] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    console.log("Current user role:", userRole);
    if (userRole) {
      setRole(userRole.toUpperCase());
      console.log("Setting role to:", userRole.toUpperCase());
    }
  }, []);

  // Color themes based on role
  const themes = {
    ADMIN: {
      main: '#1a1a1a',
      secondary: '#242424',
      border: '#363636',
      hover: '#2d2d2d',
      hoverBorder: '#404040',
      accent: '#64CCC5',
      icons: [
        { icon: 'fas fa-cog', top: '20%', right: '10%', opacity: '0.07' },
        { icon: 'fas fa-shield-alt', bottom: '30%', left: '5%', opacity: '0.05' },
        { icon: 'fas fa-chart-line', bottom: '10%', right: '15%', opacity: '0.06' }
      ]
    },
    USER: {
      main: '#2e1065',  // Deep purple
      secondary: '#3b1a7e',  // Rich purple
      border: '#4c2a8c',  // Medium purple
      hover: '#5b3a9c',  // Light purple
      hoverBorder: '#6b4aac',  // Lighter purple
      accent: '#d8b4fe',  // Light violet
      icons: [
        { icon: 'fas fa-user-circle', top: '15%', right: '10%', opacity: '0.08' },
        { icon: 'fas fa-calendar-check', bottom: '30%', left: '7%', opacity: '0.06' },
        { icon: 'fas fa-comments', bottom: '15%', right: '12%', opacity: '0.07' }
      ]
    },
    NUTRICIST: {
      main: '#003300',
      secondary: '#004d00',
      border: '#006600',
      hover: '#008000',
      hoverBorder: '#00b300',
      accent: '#00ff00',
      icons: [
        { icon: 'fas fa-apple-alt', top: '15%', right: '10%', opacity: '0.08' },
        { icon: 'fas fa-carrot', bottom: '25%', left: '8%', opacity: '0.06' },
        { icon: 'fas fa-leaf', bottom: '15%', right: '12%', opacity: '0.07' }
      ]
    },
    THERAPIST: {
      main: '#000066',
      secondary: '#000099',
      border: '#0000cc',
      hover: '#0000ff',
      hoverBorder: '#3333ff',
      accent: '#66b3ff',
      icons: [
        { icon: 'fas fa-brain', top: '20%', right: '8%', opacity: '0.08' },
        { icon: 'fas fa-heart', bottom: '30%', left: '7%', opacity: '0.06' },
        { icon: 'fas fa-hand-holding-heart', bottom: '12%', right: '10%', opacity: '0.07' }
      ]
    }
  };

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  // Get current theme based on role, default to admin theme
  const currentTheme = themes[role] || themes.ADMIN;
  console.log("Current role:", role);
  console.log("Applied theme:", currentTheme);

  return (
    <div className="sidebar" 
      style={{
        background: currentTheme.main,
        boxShadow: '0 0 30px rgba(0,0,0,0.2)'
      }}
    >
      <div className="sidebar-wrapper" style={{ 
        background: currentTheme.main,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Icons */}
        {currentTheme.icons.map((iconData, index) => (
          <i
            key={index}
            className={iconData.icon}
            style={{
              position: 'absolute',
              fontSize: '64px',
              opacity: iconData.opacity || '0.07',
              color: '#fff',
              transform: 'rotate(-15deg)',
              pointerEvents: 'none',
              filter: 'blur(1px)',
              ...iconData
            }}
          />
        ))}
        <div 
          className="logo"
          style={{
            padding: '28px 20px',
            marginBottom: '15px',
            background: currentTheme.secondary,
            borderBottom: `1px solid ${currentTheme.border}`,
            position: 'relative',
            zIndex: 1
          }}
        >
          <NavLink 
            to="/admin/dashboard" 
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ 
              fontSize: '26px',
              fontWeight: '600',
              color: '#fff',
              letterSpacing: '0.5px',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              Medicare
              <span style={{ 
                color: currentTheme.accent,
                marginLeft: '2px',
                fontSize: '28px'
              }}>+</span>
            </span>
          </NavLink>
        </div>

        <Nav style={{ padding: '0 15px' }}>
          {routes
            .filter(route => !route.redirect && !route.hidden)
            .map((prop, key) => {
              if (prop.name === "Typography") {
                return (
                  <li 
                    className="nav-item" 
                    key={key}
                    style={{
                      marginBottom: '10px'
                    }}
                  >
                    <div
                      className="nav-link"
                      onClick={() => setOpenTypography(!openTypography)}
                      style={{ 
                        cursor: "pointer",
                        padding: '12px 18px',
                        borderRadius: '12px',
                        color: '#fff',
                        opacity: '0.85',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: currentTheme.secondary,
                        border: `1px solid ${currentTheme.border}`,
                        fontFamily: "'Inter', sans-serif"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background = currentTheme.hover;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.border = `1px solid ${currentTheme.hoverBorder}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '0.85';
                        e.currentTarget.style.background = currentTheme.secondary;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.border = `1px solid ${currentTheme.border}`;
                      }}
                    >
                      <i className={prop.icon} style={{ 
                        fontSize: '18px',
                        color: currentTheme.accent,
                        width: '24px',
                        textAlign: 'center'
                      }} />
                      <span style={{ 
                        fontSize: '14.5px', 
                        fontWeight: '500',
                        letterSpacing: '0.3px'
                      }}>
                        {prop.name}
                      </span>
                      <i className="fas fa-chevron-down" style={{ 
                        marginLeft: 'auto', 
                        fontSize: '12px', 
                        opacity: '0.7',
                        color: currentTheme.accent
                      }} />
                    </div>
                    {openTypography && (
                      <ul className="nav flex-column" style={{ padding: '8px 0 8px 48px' }}>
                        <li className="nav-item" style={{ marginBottom: '8px' }}>
                          <NavLink
                            to="/admin/terapisti"
                            className="nav-link"
                            style={{
                              padding: '10px 16px',
                              color: 'rgba(255, 255, 255, 0.75)',
                              fontSize: '13.5px',
                              transition: 'all 0.2s ease',
                              borderRadius: '8px',
                              fontFamily: "'Inter', sans-serif",
                              letterSpacing: '0.2px',
                              fontWeight: '400'
                            }}
                            activeStyle={{
                              color: '#fff',
                              background: currentTheme.hover,
                              borderLeft: `3px solid ${currentTheme.accent}`,
                              fontWeight: '500'
                            }}
                          >
                            Shiko Terapistët
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            to="/admin/nutricisti"
                            className="nav-link"
                            style={{
                              padding: '10px 16px',
                              color: 'rgba(255, 255, 255, 0.75)',
                              fontSize: '13.5px',
                              transition: 'all 0.2s ease',
                              borderRadius: '8px',
                              fontFamily: "'Inter', sans-serif",
                              letterSpacing: '0.2px',
                              fontWeight: '400'
                            }}
                            activeStyle={{
                              color: '#fff',
                              background: currentTheme.hover,
                              borderLeft: `3px solid ${currentTheme.accent}`,
                              fontWeight: '500'
                            }}
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
                  <li 
                    className={activeRoute(prop.layout + prop.path)} 
                    key={key}
                    style={{
                      marginBottom: '10px'
                    }}
                  >
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        color: '#fff',
                        opacity: '0.85',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: currentTheme.secondary,
                        border: `1px solid ${currentTheme.border}`,
                        fontFamily: "'Inter', sans-serif"
                      }}
                      activeStyle={{
                        opacity: '1',
                        background: currentTheme.hover,
                        borderLeft: `3px solid ${currentTheme.accent}`,
                        transform: 'translateY(-1px)'
                      }}
                    >
                      <i className={prop.icon} style={{ 
                        fontSize: '18px',
                        color: currentTheme.accent,
                        width: '24px',
                        textAlign: 'center'
                      }} />
                      <span style={{ 
                        fontSize: '14.5px', 
                        fontWeight: '500',
                        letterSpacing: '0.3px'
                      }}>
                        {prop.name}
                      </span>
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
