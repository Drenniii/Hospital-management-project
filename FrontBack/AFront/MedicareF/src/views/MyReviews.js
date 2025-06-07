import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert
} from "react-bootstrap";
import { Rating } from '@mui/material';
import ApiService from "service/ApiService";
import { ReviewModal } from "../components/Review/Review";

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      // Get all appointments for the user
      const appointments = await ApiService.getClientAppointments();
      
      // Get reviews for each appointment
      const reviewPromises = appointments.map(async appointment => {
        try {
          const review = await ApiService.getReviewByAppointment(appointment.id);
          if (review) {
            return {
              ...review,
              appointmentId: appointment.id,
              professionalType: appointment.type,
              professionalName: `${appointment.professional.firstname} ${appointment.professional.lastname}`,
              appointmentDate: appointment.appointmentDateTime
            };
          }
          return null;
        } catch (err) {
          return null; // If no review exists for this appointment
        }
      });
      
      const allReviews = await Promise.all(reviewPromises);
      // Filter out null values (appointments without reviews) and sort by date
      const validReviews = allReviews
        .filter(review => review !== null)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setReviews(validReviews);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await ApiService.deleteReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (err) {
        console.error("Error deleting review:", err);
        setError("Failed to delete review. Please try again.");
      }
    }
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <Card.Title as="h4">My Reviews</Card.Title>
              <p className="card-category">Reviews you've written for your appointments</p>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {reviews.length === 0 ? (
                <Alert variant="info">
                  You haven't written any reviews yet.
                </Alert>
              ) : (
                <Row>
                  {reviews.map((review) => (
                    <Col md="6" key={review.id}>
                      <Card className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <h5 className="mb-0">
                                {review.professionalType === "NUTRICIST" ? "Nutritionist" : "Therapist"} Review
                              </h5>
                              <p className="text-muted mb-0">
                                {review.professionalName}
                              </p>
                              <small className="text-muted">
                                Appointment: {formatDate(review.appointmentDate)}
                              </small>
                              <br />
                              <small className="text-muted">
                                Reviewed on: {formatDate(review.createdAt)}
                              </small>
                            </div>
                            <Rating value={review.rating} readOnly />
                          </div>
                          <Card.Text>{review.comment}</Card.Text>
                          <div className="d-flex justify-content-end mt-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(review)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(review.id)}
                            >
                              Delete
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

      {selectedReview && (
        <ReviewModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedReview(null);
          }}
          appointmentId={selectedReview.appointmentId}
          initialRating={selectedReview.rating}
          initialComment={selectedReview.comment}
          isEditing={true}
          reviewId={selectedReview.id}
          onReviewSubmitted={() => {
            loadReviews();
            setShowEditModal(false);
            setSelectedReview(null);
          }}
        />
      )}
    </Container>
  );
}

export default MyReviews; 