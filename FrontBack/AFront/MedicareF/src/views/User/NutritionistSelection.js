import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal as BootstrapModal, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import ApiService from "service/ApiService";

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
  padding: "30px",
  borderRadius: "16px",
  width: "600px",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 10px 25px rgba(0,0,0,.2)",
  animation: "modalFadeIn 0.3s ease-out",
};

// Add default profile icon styles
const defaultProfileStyle = {
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  fontSize: '80px',
  color: '#198754', // Bootstrap success color for nutritionists
  borderRadius: '4px 4px 0 0'
};

// Add new styles
const sectionStyle = {
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
  border: "1px solid #e9ecef",
  transition: "transform 0.2s ease",
  cursor: "default",
  boxShadow: "0 2px 4px rgba(0,0,0,.05)",
};

const imageContainerStyle = {
  position: "relative",
  width: "180px",
  height: "180px",
  margin: "0 auto 2rem",
  borderRadius: "50%",
  boxShadow: "0 4px 15px rgba(0,0,0,.1)",
  border: "3px solid #198754",
  overflow: "hidden",
  transition: "transform 0.3s ease",
};

// Add keyframes for modal animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .profile-section:hover {
    transform: translateY(-2px);
  }

  .profile-image-container:hover {
    transform: scale(1.02);
  }

  .profile-details h6 {
    color: #198754;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #19875422;
    padding-bottom: 0.5rem;
  }

  .profile-details p {
    color: #495057;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #198754;
  }

  .modal-content-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .modal-content-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb {
    background: #19875455;
    border-radius: 4px;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb:hover {
    background: #198754;
  }
`;
document.head.appendChild(styleSheet);

function BookingModal({ show, onClose, nutricist, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter available times (9 AM to 5 PM, hourly slots)
  const availableTimes = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingError("Please select both date and time");
      return;
    }

    try {
      setLoading(true);
      const [year, month, day] = selectedDate.split('-');
      const [hours] = selectedTime.split(':');
      const dateTime = new Date(year, month - 1, day, parseInt(hours), 0, 0, 0);
      
      // Format date for backend
      const formattedDate = dateTime.toISOString().replace('Z', '');

      // Get current user
      const currentUser = await ApiService.getCurrentUser();

      // Create appointment
      await ApiService.createAppointment(
        currentUser.id,
        nutricist.id,
        formattedDate,
        'NUTRITION',
        notes
      );

      alert('Appointment booked successfully!');
      onClose();
      onConfirm();
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate max date (e.g., 3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-4">Book Nutrition Consultation</h4>
        
        {nutricist && (
          <div className="mb-3">
            <h6>Booking with: {nutricist.firstname} {nutricist.lastname}</h6>
          </div>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              max={maxDateStr}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Time</Form.Label>
            <Form.Select 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={loading}
            >
              <option value="">Choose a time</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Add any dietary restrictions, preferences, or other notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Form>

        {bookingError && (
          <div className="alert alert-danger mb-3">{bookingError}</div>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add NutritionistProfileModal component
function NutritionistProfileModal({ show, onClose, nutritionist }) {
  if (!show || !nutritionist) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div 
        style={modalContentStyle} 
        onClick={(e) => e.stopPropagation()}
        className="modal-content-scroll"
      >
        <button className="close-button" onClick={onClose}>×</button>
        
        <div style={imageContainerStyle} className="profile-image-container">
          {nutritionist.image ? (
            <img 
              src={nutritionist.image}
              alt={`${nutritionist.firstname} ${nutritionist.lastname}`}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              color: '#198754'
            }}>
              <i className="fas fa-user-nurse"></i>
            </div>
          )}
        </div>

        <div className="profile-details">
          <h3 className="text-center mb-4" style={{ color: '#198754' }}>
            {nutritionist.firstname} {nutritionist.lastname}
          </h3>
          
          {nutritionist.description && (
            <div style={sectionStyle} className="profile-section">
              <h6>
                <i className="fas fa-comment-medical me-2"></i>
                Description
              </h6>
              <p>{nutritionist.description}</p>
            </div>
          )}

          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-address-card" style={{ marginRight: '20px' }}></i>
              Contact Information
            </h6>
            <p><strong>Email:</strong> {nutritionist.email}</p>
            {nutritionist.phoneNumber && <p><strong>Phone:</strong> {nutritionist.phoneNumber}</p>}
            {nutritionist.address && <p><strong>Address:</strong> {nutritionist.address}</p>}
          </div>

          {nutritionist.specialization && (
            <div style={sectionStyle} className="profile-section">
              <h6>
                <i className="fas fa-star me-2"></i>
                Specialization
              </h6>
              <p>{nutritionist.specialization}</p>
            </div>
          )}

          {nutritionist.experience && (
            <div style={sectionStyle} className="profile-section">
              <h6>
                <i className="fas fa-briefcase me-2"></i>
                Experience
              </h6>
              <p>{nutritionist.experience}</p>
            </div>
          )}

          {nutritionist.education && (
            <div style={sectionStyle} className="profile-section">
              <h6>
                <i className="fas fa-graduation-cap me-2"></i>
                Education
              </h6>
              <p>{nutritionist.education}</p>
            </div>
          )}

          {nutritionist.about && (
            <div style={sectionStyle} className="profile-section">
              <h6>
                <i className="fas fa-user" style={{ marginRight: '20px' }}></i>
                About
              </h6>
              <p>{nutritionist.about}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <Button 
            variant="success" 
            onClick={onClose}
            className="px-4 py-2"
            style={{
              borderRadius: '50px',
              fontSize: '1.1rem',
              boxShadow: '0 2px 5px rgba(0,0,0,.1)',
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function NutritionistSelection() {
  const history = useHistory();
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNutricist, setSelectedNutricist] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    loadNutritionists();
  }, [history]);

  const loadNutritionists = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllNutritionists();
      console.log('Nutritionists response:', response);
      
      setNutritionists(response || []);
      setError(null);
    } catch (err) {
      console.error("Error loading nutritionists:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Please make sure you are logged in.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load nutritionists. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    if (error.includes("Access denied") || error.includes("Session expired")) {
      localStorage.clear();
      history.push("/login");
    } else {
      loadNutritionists();
    }
  };

  const handleBooking = (nutricist) => {
    setSelectedNutricist(nutricist);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    // Reload nutritionists to refresh any availability changes
    await loadNutritionists();
  };

  const handleViewProfile = (nutritionist) => {
    // Check if user is logged in
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    setSelectedNutricist(nutritionist);
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <Spinner animation="border" role="status" variant="success">
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
            variant="outline-success" 
            className="mt-2"
            onClick={handleError}
          >
            {error.includes("Access denied") || error.includes("Session expired") 
              ? "Go to Login" 
              : "Try Again"}
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md="12">
          <h4>Select a Nutritionist</h4>
          <p>Choose from our certified nutrition experts</p>
        </Col>
      </Row>
      <Row>
        {nutritionists.length === 0 ? (
          <Col>
            <div className="alert alert-info">
              No nutritionists available at the moment. Please check back later.
            </div>
          </Col>
        ) : (
          nutritionists.map((nutritionist) => (
            <Col md="4" key={nutritionist.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                {nutritionist.image ? (
                  <Card.Img 
                    variant="top" 
                    src={nutritionist.image}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  style={defaultProfileStyle}
                  className={nutritionist.image ? 'd-none' : ''}
                >
                  <i className="fas fa-user-nurse"></i>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    {`${nutritionist.firstname} ${nutritionist.lastname}`}
                  </Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {nutritionist.email}<br/>
                    {nutritionist.phoneNumber && (
                      <><strong>Phone:</strong> {nutritionist.phoneNumber}<br/></>
                    )}
                    {nutritionist.address && (
                      <><strong>Address:</strong> {nutritionist.address}<br/></>
                    )}
                  </Card.Text>
                  <div className="mt-auto d-grid gap-2">
                    <Button 
                      variant="outline-success"
                      onClick={() => handleBooking(nutritionist)}
                    >
                      Book Consultation
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => handleViewProfile(nutritionist)}
                    >
                      View Full Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        nutricist={selectedNutricist}
        onConfirm={handleConfirmBooking}
      />

      <NutritionistProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        nutritionist={selectedNutricist}
      />
    </Container>
  );
}

export default NutritionistSelection; 