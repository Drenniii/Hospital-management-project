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
} from "react-bootstrap";
import ApiService from "service/ApiService";
import CreateAppointment from "./CreateAppointment";

// Modal styles
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
  width: "90%",
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

function AppointmentModal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Schedule New Appointment</h4>
          <Button variant="link" onClick={onClose} className="p-0 text-dark">
            <i className="fas fa-times"></i>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const history = useHistory();

  useEffect(() => {
    console.log("Appointments component mounted");
    const token = ApiService.getAccessToken();
    if (!token) {
      console.log("No authentication token found, redirecting to login");
      history.push("/login");
      return;
    }

    console.log("Component mounted. User role:", userRole);
    loadAppointments();
  }, [history]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      console.log("Fetching appointments for role:", userRole);
      
      if (!userRole) {
        throw new Error("User role not found");
      }
      
      if (userRole === "USER") {
        console.log("Calling getClientAppointments");
        response = await ApiService.getClientAppointments();
      } else if (userRole === "THERAPIST" || userRole === "NUTRICIST") {
        console.log("Calling getProfessionalAppointments");
        response = await ApiService.getProfessionalAppointments();
      } else {
        throw new Error(`Invalid user role: ${userRole}`);
      }

      console.log("Appointments response:", response);
      setAppointments(response || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("Authentication error, redirecting to login");
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
      loadAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update appointment status. Please try again.");
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await ApiService.deleteAppointment(appointmentId);
      loadAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

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

  console.log("Rendering Appointments component with state:", {
    showCreateModal,
    userRole,
    appointmentsCount: appointments?.length,
    loading,
    error
  });

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
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
          <Button 
            variant="outline-primary" 
            className="mt-2"
            onClick={loadAppointments}
          >
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title as="h4">My Appointments</Card.Title>
                <p className="card-category">
                  {userRole === "USER" 
                    ? "Your scheduled appointments with professionals"
                    : "Your scheduled appointments with clients"}
                </p>
              </div>
              {userRole === "USER" && (
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="btn-fill"
                >
                  Schedule New Appointment
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {appointments.length === 0 ? (
                <div className="text-center p-3">
                  <p className="mb-0">No appointments found.</p>
                </div>
              ) : (
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
                          {appointment.status === "SCHEDULED" && (
                            <>
                              {(userRole === "THERAPIST" || userRole === "NUTRICIST") && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleStatusUpdate(appointment.id, "COMPLETED")}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AppointmentModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      >
        <CreateAppointment
          onHide={() => setShowCreateModal(false)}
          onAppointmentCreated={() => {
            loadAppointments();
            setShowCreateModal(false);
          }}
        />
      </AppointmentModal>
    </Container>
  );
}

export default Appointments; 