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

function BookingModal({ show, onClose, nutritionist, onConfirm }) {
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
        nutritionist.id,
        formattedDate,
        'NUTRITION',
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
        <h4 className="mb-4">Book Nutrition Session</h4>
        
        {nutritionist && (
          <div className="mb-4">
            <h6>Booking with: {nutritionist.firstname} {nutritionist.lastname}</h6>
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
              placeholder="Add any special notes or dietary requirements for your session..."
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

// Add NutritionistProfileModal component
function NutritionistProfileModal({ show, onClose, nutritionist }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && nutritionist) {
      loadReviews();
    }
  }, [show, nutritionist]);

  const loadReviews = async () => {
    try {
      const reviewsData = await ApiService.getProfessionalReviews(nutritionist.id);
      
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
              color: '#0d6efd'
            }}>
              <i className="fas fa-user-md"></i>
            </div>
          )}
        </div>

        <h3 className="text-center mb-4" style={{ color: '#0d6efd' }}>
          {nutritionist.firstname} {nutritionist.lastname}
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

function NutritionistSelection() {
  const history = useHistory();
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNutritionists, setFilteredNutritionists] = useState([]);

  useEffect(() => {
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    loadNutritionists();
    loadUserCredits();
  }, [history]);

  useEffect(() => {
    // Filter nutritionists based on search query
    const filtered = nutritionists.filter(nutritionist => 
      nutritionist.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nutritionist.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nutritionist.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nutritionist.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNutritionists(filtered);
  }, [searchQuery, nutritionists]);

  const loadNutritionists = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllNutritionists();
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
      loadNutritionists();
    }
  };

  const handleBooking = (nutritionist) => {
    setSelectedNutritionist(nutritionist);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    await loadNutritionists();
    await loadUserCredits();
  };

  const handleViewProfile = (nutritionist) => {
    const token = ApiService.getAccessToken();
    if (!token) {
      history.push("/login");
      return;
    }
    setSelectedNutritionist(nutritionist);
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
              <Card.Title as="h4">Select a Nutritionist</Card.Title>
              <p className="card-category">Choose a nutritionist to book an appointment</p>
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
              ) : filteredNutritionists.length === 0 ? (
                <div className="text-center p-5">
                  <p>No nutritionists found matching your search.</p>
                </div>
              ) : (
                <Row>
                  {filteredNutritionists.map((nutritionist) => (
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
                          <i className="fas fa-user-md"></i>
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
                            <div className="mt-2">
                              <strong>Session Cost:</strong> $50
                            </div>
                          </Card.Text>
                          <div className="mt-auto d-flex gap-2">
                            <Button 
                              variant={userCredits >= 50 ? "outline-primary" : "outline-secondary"}
                              className="flex-grow-1"
                              onClick={() => handleBooking(nutritionist)}
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
                              onClick={() => handleViewProfile(nutritionist)}
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
        nutritionist={selectedNutritionist}
        onConfirm={handleConfirmBooking}
      />

      <NutritionistProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        nutritionist={selectedNutritionist}
      />
    </Container>
  );
}

export default NutritionistSelection; 