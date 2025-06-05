import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Nav,
  Tab
} from "react-bootstrap";
import ApiService from "service/ApiService";
import DietPlans from "../components/DietPlans/DietPlans";
import Psychology from "../components/Psychology/Psychology";

// Custom Modal Styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1050,
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

// Helper function for status badge variants
const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "NO_SHOW":
      return "warning";
    default:
      return "secondary";
  }
};

function ViewDetailsPanel({ appointment, show, onClose }) {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Appointment Details</h4>
        {appointment ? (
          <>
            <p><strong>Client:</strong> {appointment.client.firstname} {appointment.client.lastname}</p>
            <p><strong>Date & Time:</strong> {new Date(appointment.appointmentDateTime).toLocaleString()}</p>
            <p><strong>Type:</strong> {appointment.type}</p>
            <p>
              <strong>Status:</strong>{" "}
              <Badge 
                bg={getStatusBadgeVariant(appointment.status)}
                text={appointment.status === "WARNING" ? "dark" : "white"}
              >
                {appointment.status}
              </Badge>
            </p>
            <p><strong>Notes:</strong> {appointment.notes || "No notes provided"}</p>
            <p><strong>Created At:</strong> {new Date(appointment.createdAt).toLocaleString()}</p>
          </>
        ) : (
          <p>No appointment data to display.</p>
        )}
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function AppointmentTable({ appointments, userRole, onStatusUpdate, onDelete }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewPanelVisible, setViewPanelVisible] = useState(false);
  const [showDietPlans, setShowDietPlans] = useState(false);
  const [showPsychology, setShowPsychology] = useState(false);

  const handleDelete = (appointmentId, status) => {
    const message = status === "COMPLETED" 
      ? "Are you sure you want to delete this completed appointment record?"
      : "Are you sure you want to cancel this appointment?";
    
    if (window.confirm(message)) {
      onDelete(appointmentId);
    }
  };

  const openViewPanel = (appointment) => {
    setSelectedAppointment(appointment);
    setViewPanelVisible(true);
  };

  const closeViewPanel = () => {
    setSelectedAppointment(null);
    setViewPanelVisible(false);
  };

  return (
    <>
      <Table responsive>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>{userRole === "USER" ? "Professional" : "Client"}</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>
                {new Date(appointment.appointmentDateTime).toLocaleString()}
              </td>
              <td>
                {userRole === "USER"
                  ? `${appointment.professional.firstname} ${appointment.professional.lastname}`
                  : `${appointment.client.firstname} ${appointment.client.lastname}`}
              </td>
              <td>{appointment.type}</td>
              <td>
                <Badge 
                  bg={getStatusBadgeVariant(appointment.status)}
                  text={appointment.status === "WARNING" ? "dark" : "white"}
                >
                  {appointment.status}
                </Badge>
              </td>
              <td>
                {appointment.status === "SCHEDULED" ? (
                  <>
                    {(userRole === "THERAPIST" || userRole === "NUTRICIST") && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openViewPanel(appointment)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => onStatusUpdate(appointment.id, "COMPLETED")}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                    {userRole === "USER" && (
                      <>
                        {appointment.type === "NUTRITION" && (
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => setShowDietPlans(true)}
                          >
                            <i className="nc-icon nc-paper-2 mr-1"></i>
                            View Diet Plans
                          </Button>
                        )}
                        {appointment.type === "THERAPY" && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => setShowPsychology(true)}
                          >
                            <i className="nc-icon nc-sound-wave mr-1"></i>
                            View Resources
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(appointment.id, appointment.status)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : appointment.status === "COMPLETED" && (
                  <>
                    {(userRole === "THERAPIST" || userRole === "NUTRICIST") && (
                      <>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openViewPanel(appointment)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(appointment.id, appointment.status)}
                        >
                          Delete Record
                        </Button>
                      </>
                    )}
                    {userRole === "USER" && (
                      <>
                        {appointment.type === "NUTRITION" && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => setShowDietPlans(true)}
                          >
                            <i className="nc-icon nc-paper-2 mr-1"></i>
                            View Diet Plans
                          </Button>
                        )}
                        {appointment.type === "THERAPY" && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => setShowPsychology(true)}
                          >
                            <i className="nc-icon nc-sound-wave mr-1"></i>
                            View Resources
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ViewDetailsPanel
        appointment={selectedAppointment}
        show={viewPanelVisible}
        onClose={closeViewPanel}
      />

      <DietPlans 
        show={showDietPlans} 
        onHide={() => setShowDietPlans(false)} 
      />

      <Psychology 
        show={showPsychology} 
        onHide={() => setShowPsychology(false)} 
      />
    </>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const userRole = localStorage.getItem("userRole");
  const history = useHistory();

  useEffect(() => {
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }

    loadAppointments();
  }, [history]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (!userRole) {
        throw new Error("User role not found");
      }
      
      if (userRole === "USER") {
        response = await ApiService.getClientAppointments();
      } else if (userRole === "THERAPIST" || userRole === "NUTRICIST") {
        response = await ApiService.getProfessionalAppointments();
      } else {
        throw new Error(`Invalid user role: ${userRole}`);
      }

      setAppointments(response || []);
    } catch (err) {
      console.error("Error loading appointments:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        history.push("/login");
        return;
      }

      setError(err.response?.data?.message || err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await ApiService.updateAppointmentStatus(appointmentId, newStatus);
      await loadAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update appointment status. Please try again.");
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      await ApiService.deleteAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <p>{error}</p>
          <Button 
            variant="outline-primary" 
            className="mt-2"
            onClick={loadAppointments}
          >
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  const activeAppointments = appointments.filter(
    app => app.status === "SCHEDULED"
  );

  const completedAppointments = appointments.filter(
    app => app.status === "COMPLETED"
  );

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">My Appointments</Card.Title>
              <p className="card-category">
                {userRole === "USER" 
                  ? "Your scheduled appointments with professionals"
                  : "Your scheduled appointments with clients"}
              </p>
            </Card.Header>
            <Card.Body>
              {userRole === "USER" ? (
                activeAppointments.length === 0 ? (
                  <div className="text-center p-3">
                    <p className="mb-0">No active appointments found.</p>
                  </div>
                ) : (
                  <AppointmentTable
                    appointments={activeAppointments}
                    userRole={userRole}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                )
              ) : (
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="active">
                        Active Appointments {activeAppointments.length > 0 && 
                          <Badge bg="primary">{activeAppointments.length}</Badge>}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="completed">
                        Completed Appointments {completedAppointments.length > 0 && 
                          <Badge bg="success">{completedAppointments.length}</Badge>}
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="active">
                      {activeAppointments.length === 0 ? (
                        <div className="text-center p-3">
                          <p className="mb-0">No active appointments found.</p>
                        </div>
                      ) : (
                        <AppointmentTable
                          appointments={activeAppointments}
                          userRole={userRole}
                          onStatusUpdate={handleStatusUpdate}
                          onDelete={handleDelete}
                        />
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="completed">
                      {completedAppointments.length === 0 ? (
                        <div className="text-center p-3">
                          <p className="mb-0">No completed appointments found.</p>
                        </div>
                      ) : (
                        <AppointmentTable
                          appointments={completedAppointments}
                          userRole={userRole}
                          onStatusUpdate={handleStatusUpdate}
                          onDelete={handleDelete}
                        />
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Appointments; 