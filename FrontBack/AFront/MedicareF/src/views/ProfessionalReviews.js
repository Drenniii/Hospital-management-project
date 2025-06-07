import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert
} from "react-bootstrap";
import ApiService from "service/ApiService";

// Custom Star Rating Component
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

function ProfessionalReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      
      // Get all appointments first
      const appointments = await ApiService.getProfessionalAppointments();
      console.log("Professional appointments:", appointments);

      // Get reviews for the professional
      const reviewsData = await ApiService.getProfessionalReviews(user.id);
      console.log("Reviews data:", reviewsData);

      // Combine reviews with appointment data
      const reviewsWithAppointments = reviewsData.map(review => {
        const appointment = appointments.find(apt => apt.id === review.appointmentId);
        return {
          ...review,
          appointment: appointment || null,
          clientName: appointment ? `${appointment.client.firstname} ${appointment.client.lastname}` : 'Anonymous',
          appointmentDate: appointment ? appointment.appointmentDateTime : null
        };
      });

      // Sort reviews by date (newest first)
      const sortedReviews = reviewsWithAppointments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setReviews(sortedReviews);

      // Calculate statistics
      const totalReviews = sortedReviews.length;
      const totalRating = sortedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      // Calculate rating distribution
      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      sortedReviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      setStats({
        averageRating,
        totalReviews,
        ratingDistribution
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews. Please try again later.");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>My Reviews</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <Card className="mb-4">
                    <Card.Body>
                      <Row>
                        <Col md={4} className="text-center">
                          <h2>{stats.averageRating.toFixed(1)}</h2>
                          <StarRating value={Math.round(stats.averageRating)} readOnly />
                          <p className="text-muted mt-2">{stats.totalReviews} total reviews</p>
                        </Col>
                        <Col md={8}>
                          {Object.entries(stats.ratingDistribution)
                            .sort(([a], [b]) => b - a)
                            .map(([rating, count]) => (
                              <div key={rating} className="mb-2">
                                <div className="d-flex align-items-center">
                                  <StarRating value={Number(rating)} readOnly />
                                  <div className="flex-grow-1 mx-3">
                                    <div className="progress">
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{
                                          width: `${(count / stats.totalReviews) * 100}%`
                                        }}
                                        aria-valuenow={(count / stats.totalReviews) * 100}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                      />
                                    </div>
                                  </div>
                                  <span className="text-muted">{count}</span>
                                </div>
                              </div>
                            ))}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {reviews.length === 0 ? (
                    <Alert variant="info">
                      You haven't received any reviews yet.
                    </Alert>
                  ) : (
                    <Row>
                      {reviews.map((review) => (
                        <Col md="6" key={review.id}>
                          <Card className="mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                  <StarRating value={review.rating} readOnly />
                                  <h6 className="mb-1 mt-2">{review.clientName}</h6>
                                  <p className="text-muted mb-0">
                                    Appointment Date: {formatDate(review.appointmentDate)}
                                  </p>
                                  <small className="text-muted">
                                    Reviewed on: {formatDate(review.createdAt)}
                                  </small>
                                </div>
                              </div>
                              <Card.Text>{review.comment}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfessionalReviews; 