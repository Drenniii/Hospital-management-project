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
  Tab,
  Dropdown,
  Toast,
  ToastContainer
} from "react-bootstrap";
import ApiService from "service/ApiService";
import DietPlans from "../components/DietPlans/DietPlans";
import Psychology from "../components/Psychology/Psychology";

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

// Add History Modal Component
function AddHistoryModal({ show, onHide, appointmentId, appointment, appointments }) {
  const [historyText, setHistoryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (appointment) {
      setSelectedAppointment(appointment);
    }
  }, [appointment]);

  useEffect(() => {
    if (show && selectedAppointment) {
      loadAppointmentHistory();
    }
  }, [show, selectedAppointment]);

  const loadAppointmentHistory = async () => {
    if (!selectedAppointment) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await ApiService.getAppointmentHistories(selectedAppointment.id);
      console.log('Loaded appointment history:', history);
      setAppointmentHistory(history);
    } catch (error) {
      console.error("Error loading appointment history:", error);
      if (error.response?.status === 403) {
        // If we get a 403, we might need to refresh the token or redirect to login
        const token = ApiService.getAccessToken();
        if (!token) {
          window.location.href = '/login';
          return;
        }
        alert("You don't have permission to view this appointment's history.");
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification("localhost:3000 says", {
        body: message
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("localhost:3000 says", {
            body: message
          });
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!historyText.trim() || !selectedAppointment) return;
    
    setIsSubmitting(true);
    try {
      const appointmentId = parseInt(selectedAppointment.id);
      if (isNaN(appointmentId)) {
        throw new Error('Invalid appointment ID');
      }
      
      await ApiService.saveAppointmentHistory(appointmentId, historyText);
      await loadAppointmentHistory();
      setHistoryText("");
      showNotification("Note saved successfully");
    } catch (error) {
      console.error("Error saving history:", error);
      if (error.response?.status === 403) {
        alert("You don't have permission to add notes to this appointment.");
      } else {
        alert(error.response?.data?.message || "Failed to save history. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || !editingHistoryId) return;
    
    setIsSubmitting(true);
    try {
      console.log('Attempting to update history:', {
        historyId: editingHistoryId,
        text: editText
      });
      
      await ApiService.updateAppointmentHistory(editingHistoryId, editText);
      await loadAppointmentHistory();
      setEditingHistoryId(null);
      setEditText("");
      showNotification("Note updated successfully");
    } catch (error) {
      console.error("Error updating history:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = "Failed to update note. ";
      if (error.response?.status === 404) {
        errorMessage += "The note could not be found.";
      } else if (error.response?.status === 403) {
        errorMessage += "You don't have permission to edit this note.";
        // If token is missing, redirect to login
        const token = ApiService.getAccessToken();
        if (!token) {
          window.location.href = '/login';
          return;
        }
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (history) => {
    console.log('Starting edit for history:', history);
    // Check for different possible ID fields
    const historyId = history.id || history.historyId || history._id;
    if (!historyId) {
      console.error('No valid ID found in history object:', history);
      alert('Could not edit this note - no valid ID found');
      return;
    }
    setEditingHistoryId(historyId);
    setEditText(history.historyText || history.text || history.note || '');
  };

  const cancelEditing = () => {
    setEditingHistoryId(null);
    setEditText("");
  };

  // Get all completed appointments for this client
  const getClientCompletedAppointments = () => {
    if (!appointment) return [];
    return appointments.filter(app => 
      app.status === "COMPLETED" && 
      app.client.id === appointment.client.id
    ).sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));
  };

  if (!show || !appointment || !selectedAppointment) return null;

  return (
    <div style={modalOverlayStyle} onClick={onHide}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Patient History</h4>
        
        {/* Appointment Selector Dropdown */}
        <div className="mb-3">
          <label className="form-label">Select Appointment:</label>
          <select 
            className="form-select"
            value={selectedAppointment?.id || ''}
            onChange={(e) => {
              const selected = getClientCompletedAppointments().find(app => app.id === parseInt(e.target.value));
              if (selected) {
                setSelectedAppointment(selected);
                setEditingHistoryId(null);
                setEditText("");
              }
            }}
          >
            {getClientCompletedAppointments().map((app) => (
              <option key={app.id} value={app.id}>
                {new Date(app.appointmentDateTime).toLocaleDateString()} - {app.type}
              </option>
            ))}
          </select>
        </div>

        {/* Patient Information */}
        <div className="mb-4">
          <h5>Patient Information</h5>
          <p><strong>Name:</strong> {selectedAppointment.client.firstname} {selectedAppointment.client.lastname}</p>
          <p><strong>Appointment Date:</strong> {new Date(selectedAppointment.appointmentDateTime).toLocaleString()}</p>
          <p><strong>Type:</strong> {selectedAppointment.type}</p>
        </div>

        {/* Previous History Section */}
        <div className="mb-4">
          <h5>Previous Notes</h5>
          {isLoadingHistory ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" />
            </div>
          ) : appointmentHistory.length > 0 ? (
            <div className="history-notes" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {appointmentHistory.map((history, index) => (
                <div key={index} className="p-2 mb-2 bg-light rounded">
                  {editingHistoryId === history.id ? (
                    <div>
                      <textarea
                        className="form-control mb-2"
                        rows="3"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleEdit}
                          disabled={isSubmitting || !editText.trim()}
                        >
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <small className="text-muted">
                          {new Date(history.createdAt).toLocaleString()}
                        </small>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={() => startEditing(history)}
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="mb-0">{history.historyText}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No previous notes for this appointment.</p>
          )}
        </div>

        {/* Add New Note Section */}
        <div className="mb-3">
          <label className="form-label">Add New Note</label>
          <textarea
            className="form-control"
            rows="4"
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            placeholder="Enter your notes about this patient..."
          />
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <Button className="mr-2" variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button 
            variant="primary bg-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting || !historyText.trim()}
          >
            {isSubmitting ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAppointmentForHistory, setSelectedAppointmentForHistory] = useState(null);

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

  const openHistoryModal = (appointment) => {
    setSelectedAppointmentForHistory(appointment);
    setShowHistoryModal(true);
  };

  // Get unique clients from completed appointments
  const getUniqueCompletedClients = () => {
    const uniqueClients = new Map();
    appointments
      .filter(app => app.status === "COMPLETED")
      .forEach(app => {
        if (!uniqueClients.has(app.client.id)) {
          uniqueClients.set(app.client.id, app);
        }
      });
    return Array.from(uniqueClients.values());
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
          {appointments.map((appointment) => {
            if (appointment.status === "COMPLETED") {
              // For completed appointments, only show one row per client
              const isFirstAppearance = getUniqueCompletedClients()
                .find(app => app.id === appointment.id);
              if (!isFirstAppearance) return null;
            }
            
            return (
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
                            variant="info"
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
                              variant="info"
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
                  ) : appointment.status === "COMPLETED" && (userRole === "THERAPIST" || userRole === "NUTRICIST") && (
                    <>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2 mr-3"
                        onClick={() => openViewPanel(appointment)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2 mr-3"
                        onClick={() => openHistoryModal(appointment)}
                      >
                        History
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <ViewDetailsPanel
        appointment={selectedAppointment}
        show={viewPanelVisible}
        onClose={closeViewPanel}
      />

      <AddHistoryModal
        show={showHistoryModal}
        onHide={() => {
          setShowHistoryModal(false);
          setSelectedAppointmentForHistory(null);
        }}
        appointmentId={selectedAppointmentForHistory?.id}
        appointment={selectedAppointmentForHistory}
        appointments={appointments}
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
      console.log('Updating appointment status:', { appointmentId, newStatus });
      await ApiService.updateAppointmentStatus(appointmentId, newStatus);
      console.log('Status update successful');
      await loadAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      alert("Failed to update appointment status. Please try again.");
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await ApiService.deleteAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const activeAppointments = appointments.filter(
    app => app.status === "SCHEDULED"
  );

  const completedAppointments = appointments.filter(
    app => app.status === "COMPLETED"
  );

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
            </Card.Header>
            <Card.Body>
              {userRole === "USER" ? (
                // For regular users, only show active appointments
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
                // For professionals (therapists and nutritionists), show tabs
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