import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Alert,
  Card,
  Spinner
} from "react-bootstrap";
import ApiService from "service/ApiService";

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
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

// Custom Star Rating Component
const StarRating = ({ value, onChange, disabled, readOnly }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="d-flex justify-content-center align-items-center py-2">
      {stars.map((star) => (
        <i
          key={star}
          className={`fas fa-star fa-2x mx-1 ${value >= star ? 'text-warning' : 'text-muted'}`}
          style={{ cursor: (disabled || readOnly) ? 'default' : 'pointer' }}
          onClick={() => !disabled && !readOnly && onChange(star)}
        />
      ))}
    </div>
  );
};

export function ReviewModal({ 
  show, 
  onHide, 
  appointmentId, 
  onReviewSubmitted,
  isEditing = false,
  reviewId = null,
  initialRating = 0,
  initialComment = ""
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && reviewId) {
        console.log("Updating review:", reviewId);
        await ApiService.updateReview(reviewId, {
          rating,
          comment
        });
      } else {
        console.log("Creating new review for appointment:", appointmentId);
        await ApiService.createReview(appointmentId, {
          rating,
          comment
        });
      }
      
      onReviewSubmitted && onReviewSubmitted();
      onHide();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={() => !isSubmitting && onHide()}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>{isEditing ? "Edit Review" : "Write a Review"}</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <StarRating
              value={rating}
              onChange={(newValue) => {
                setRating(newValue);
                setError("");
              }}
              disabled={isSubmitting}
            />
            {rating > 0 && (
              <div className="text-center text-muted mt-2">
                {rating} {rating === 1 ? 'Star' : 'Stars'}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              disabled={isSubmitting}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={onHide} 
              className="me-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !rating}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                isEditing ? "Update Review" : "Submit Review"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function ReviewDisplay({ review }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Rating value={review.rating} readOnly />
          <small className="text-muted">
            {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
        <Card.Text>{review.comment}</Card.Text>
      </Card.Body>
    </Card>
  );
} 