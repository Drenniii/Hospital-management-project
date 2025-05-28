import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Form } from "react-bootstrap";
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
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

// Add default profile icon styles
const defaultProfileStyle = {
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  fontSize: '80px',
  color: '#0d6efd',
  borderRadius: '4px 4px 0 0'
};

function BookingModal({ show, onClose, therapist, onConfirm }) {
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
        therapist.id,
        formattedDate,
        'THERAPY',
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
        <h4 className="mb-4">Book Physical Therapy Session</h4>
        
        {therapist && (
          <div className="mb-3">
            <h6>Booking with: {therapist.firstname} {therapist.lastname}</h6>
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
              placeholder="Add any special notes or requirements for your session..."
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
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
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

function TherapistSelection() {
  const history = useHistory();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllTherapists();
      console.log('Therapists response:', response);
      
      setTherapists(response || []);
      setError(null);
    } catch (err) {
      console.error("Error loading therapists:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Please make sure you are logged in.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load therapists. Please try again later.");
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
      loadTherapists();
    }
  };

  const handleBooking = (therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    // Reload therapists to refresh any availability changes
    await loadTherapists();
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <Spinner animation="border" role="status" variant="primary">
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
          <h4>Select a Physical Therapist</h4>
          <p>Choose from our experienced physical therapy professionals</p>
        </Col>
      </Row>
      <Row>
        {therapists.length === 0 ? (
          <Col>
            <div className="alert alert-info">
              No therapists available at the moment. Please check back later.
            </div>
          </Col>
        ) : (
          therapists.map((therapist) => (
            <Col md="4" key={therapist.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                {therapist.image ? (
                  <Card.Img 
                    variant="top" 
                    src={therapist.image}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  style={defaultProfileStyle}
                  className={therapist.image ? 'd-none' : ''}
                >
                  <i className="fas fa-user-md"></i>
                </div>
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    {`${therapist.firstname} ${therapist.lastname}`}
                  </Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {therapist.email}<br/>
                    {therapist.phoneNumber && (
                      <><strong>Phone:</strong> {therapist.phoneNumber}<br/></>
                    )}
                    {therapist.address && (
                      <><strong>Address:</strong> {therapist.address}<br/></>
                    )}
                  </Card.Text>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary"
                      onClick={() => handleBooking(therapist)}
                    >
                      Book Session
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => {
                        // Add view profile logic here
                        alert('View profile functionality will be implemented soon!');
                      }}
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
        therapist={selectedTherapist}
        onConfirm={handleConfirmBooking}
      />
    </Container>
  );
}

export default TherapistSelection; 