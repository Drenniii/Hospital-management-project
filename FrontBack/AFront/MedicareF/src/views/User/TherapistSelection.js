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
  color: '#0d6efd',
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
  border: "3px solid #0d6efd",
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
    color: #0d6efd;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #0d6efd22;
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
    color: #0d6efd;
  }

  .modal-content-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .modal-content-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb {
    background: #0d6efd55;
    border-radius: 4px;
  }

  .modal-content-scroll::-webkit-scrollbar-thumb:hover {
    background: #0d6efd;
  }
`;
document.head.appendChild(styleSheet);

function BookingModal({ show, onClose, therapist, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    if (show) {
      loadUserCredits();
    }
  }, [show]);

  const loadUserCredits = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      setUserCredits(userData.credits);
    } catch (err) {
      console.error("Error loading user credits:", err);
    }
  };

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

    if (userCredits < 50) {
      setBookingError("You need $50 to book this session. Please add more funds to your account.");
      return;
    }

    try {
      setLoading(true);
      const [year, month, day] = selectedDate.split('-');
      const [hours] = selectedTime.split(':');
      const dateTime = new Date(year, month - 1, day, parseInt(hours), 0, 0, 0);
      
      // Add the timezone offset to keep the local time when converting to ISO string
      const userTimezoneOffset = dateTime.getTimezoneOffset() * 60000;
      const formattedDate = new Date(dateTime.getTime() - userTimezoneOffset)
        .toISOString()
        .replace('Z', '');

      const currentUser = await ApiService.getCurrentUser();

      await ApiService.createAppointment(
        currentUser.id,
        therapist.id,
        formattedDate,
        'THERAPY',
        notes
      );

      alert('Appointment booked successfully! $50 has been deducted from your account.');
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
          <div className="mb-4">
            <h6>Booking with: {therapist.firstname} {therapist.lastname}</h6>
            <div className="alert alert-info">
              <p className="mb-1"><strong>Session Cost:</strong> $50</p>
              <p className="mb-0"><strong>Your Balance:</strong> ${userCredits}</p>
            </div>
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
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={loading || userCredits < 50}
          >
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
            ) : userCredits < 50 ? (
              'Insufficient Funds'
            ) : (
              'Book Session'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add TherapistProfileModal component
function TherapistProfileModal({ show, onClose, therapist }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && therapist) {
      loadReviews();
    }
  }, [show, therapist]);

  const loadReviews = async () => {
    try {
      const reviewsData = await ApiService.getProfessionalReviews(therapist.id);
      
      // Calculate simple average: total stars / number of reviews
      const totalStars = reviewsData.reduce((sum, review) => sum + review.rating, 0);
      const average = reviewsData.length > 0 ? totalStars / reviewsData.length : 0;
      
      setAverageRating(average);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, readOnly }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="d-flex align-items-center">
        {stars.map((star) => (
          <i
            key={star}
            className={`fas fa-star mx-1 ${value >= star ? 'text-warning' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  if (!show || !therapist) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div 
        style={modalContentStyle} 
        onClick={(e) => e.stopPropagation()}
        className="modal-content-scroll"
      >
        <button className="close-button" onClick={onClose}>×</button>
        
        <div style={imageContainerStyle} className="profile-image-container">
          {therapist.image ? (
            <img 
              src={therapist.image}
              alt={`${therapist.firstname} ${therapist.lastname}`}
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
              color: '#0d6efd'
            }}>
              <i className="fas fa-user-md"></i>
            </div>
          )}
        </div>

        <h3 className="text-center mb-4" style={{ color: '#0d6efd' }}>
          {therapist.firstname} {therapist.lastname}
        </h3>

        {/* Reviews Section */}
        <div style={sectionStyle} className="profile-section">
          <h6>
            <i className="fas fa-star me-2"></i>
            Rating
          </h6>
          {loading ? (
            <div className="text-center p-3">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          ) : (
            <div className="text-center">
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0d6efd', marginBottom: '10px' }}>
                {averageRating.toFixed(1)}
              </div>
              <StarRating value={Math.round(averageRating)} readOnly />
              <p className="text-muted mt-2">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          )}
        </div>
          
        {therapist.description && (
          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-comment-medical me-2"></i>
              Description
            </h6>
            <p>{therapist.description}</p>
          </div>
        )}

        <div style={sectionStyle} className="profile-section">
          <h6>
            <i className="fas fa-address-card" style={{ marginRight: '20px' }}></i>
            Contact Information
          </h6>
          <p><strong>Email:</strong> {therapist.email}</p>
          {therapist.phoneNumber && <p><strong>Phone:</strong> {therapist.phoneNumber}</p>}
          {therapist.address && <p><strong>Address:</strong> {therapist.address}</p>}
        </div>

        {therapist.specialization && (
          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-star me-2"></i>
              Specialization
            </h6>
            <p>{therapist.specialization}</p>
          </div>
        )}

        {therapist.experience && (
          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-briefcase me-2"></i>
              Experience
            </h6>
            <p>{therapist.experience}</p>
          </div>
        )}

        {therapist.education && (
          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-graduation-cap me-2"></i>
              Education
            </h6>
            <p>{therapist.education}</p>
          </div>
        )}

        {therapist.about && (
          <div style={sectionStyle} className="profile-section">
            <h6>
              <i className="fas fa-user" style={{ marginRight: '20px' }}></i>
              About
            </h6>
            <p>{therapist.about}</p>
          </div>
        )}

        <div className="text-center mt-4">
          <Button 
            variant="primary" 
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

function TherapistSelection() {
  const history = useHistory();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTherapists, setFilteredTherapists] = useState([]);

  useEffect(() => {
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    loadTherapists();
    loadUserCredits();
  }, [history]);

  useEffect(() => {
    // Filter therapists based on search query
    const filtered = therapists.filter(therapist => 
      therapist.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTherapists(filtered);
  }, [searchQuery, therapists]);

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

  const loadUserCredits = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      setUserCredits(userData.credits);
    } catch (err) {
      console.error("Error loading user credits:", err);
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

  const handleViewProfile = (therapist) => {
    // Check if user is logged in
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    setSelectedTherapist(therapist);
    setShowProfileModal(true);
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
          <Card>
            <Card.Header>
              <Card.Title as="h4">Select a Therapist</Card.Title>
              <p className="card-category">Choose a therapist to book an appointment</p>
            </Card.Header>
            <Card.Body>
              {/* Search Bar */}
              <Form className="mb-4">
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, specialization, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Form>

              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : filteredTherapists.length === 0 ? (
                <div className="text-center p-5">
                  <p>No therapists found matching your search.</p>
                </div>
              ) : (
                <Row>
                  {filteredTherapists.map((therapist) => (
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
                        <Card.Body className="d-flex flex-column">
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
                            <div className="mt-2">
                              <strong>Session Cost:</strong> $50
                            </div>
                          </Card.Text>
                          <div className="mt-auto d-flex gap-2">
                            <Button 
                              variant={userCredits >= 50 ? "outline-primary" : "outline-secondary"}
                              className="flex-grow-1"
                              onClick={() => handleBooking(therapist)}
                              disabled={userCredits < 50}
                            >
                              {userCredits >= 50 ? (
                                "Book Session"
                              ) : (
                                "Insufficient Funds"
                              )}
                            </Button>
                            <Button 
                              variant="outline-secondary"
                              onClick={() => handleViewProfile(therapist)}
                            >
                              View Full Profile
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        therapist={selectedTherapist}
        onConfirm={handleConfirmBooking}
      />

      <TherapistProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        therapist={selectedTherapist}
      />
    </Container>
  );
}

export default TherapistSelection; 