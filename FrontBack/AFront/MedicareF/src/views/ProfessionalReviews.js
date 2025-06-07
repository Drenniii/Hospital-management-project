import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert
} from "react-bootstrap";
import { Rating } from '@mui/material';
import ApiService from "service/ApiService";

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
      const sumRatings = sortedReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

      // Calculate rating distribution
      const distribution = sortedReviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0});

      setStats({
        averageRating: avgRating,
        totalReviews: totalReviews,
        ratingDistribution: distribution
      });

    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Patient Reviews</Card.Title>
              <p className="card-category">Reviews from your patients</p>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Statistics Section */}
              <Row className="mb-4">
                <Col md="4">
                  <Card className="text-center">
                    <Card.Body>
                      <h2>{stats.averageRating.toFixed(1)}</h2>
                      <Rating value={stats.averageRating} readOnly precision={0.1} />
                      <p className="mt-2 mb-0">Average Rating</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="4">
                  <Card className="text-center">
                    <Card.Body>
                      <h2>{stats.totalReviews}</h2>
                      <p className="mb-0">Total Reviews</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="4">
                  <Card>
                    <Card.Body>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="d-flex align-items-center mb-2">
                          <Rating value={rating} readOnly size="small" />
                          <div className="progress flex-grow-1 mx-2" style={{ height: "8px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`,
                                backgroundColor: "#ffd700"
                              }}
                            />
                          </div>
                          <span>{stats.ratingDistribution[rating]}</span>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Reviews List */}
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
                              <Rating value={review.rating} readOnly />
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfessionalReviews; 