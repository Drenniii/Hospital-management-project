// === Account.js ===
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Alert
} from "react-bootstrap";
import ApiService from "service/ApiService";

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

function AddCreditsPanel({ show, onClose, onNext }) {
  const [creditsToAdd, setCreditsToAdd] = useState("");

  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Add Credits</h4>
        <Form.Group className="mb-3">
          <Form.Label>Amount of credits to add:</Form.Label>
          <Form.Control
            type="number"
            value={creditsToAdd}
            onChange={(e) => setCreditsToAdd(e.target.value)}
            placeholder="Enter amount"
            required
            min="1"
          />
        </Form.Group>
        <div className="d-flex justify-content-end gap-2">
          <Button className="mr-2" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onNext(creditsToAdd)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function PaymentPanel({ show, onClose, amount, onSubmit }) {
  const [paymentForm, setPaymentForm] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(paymentForm);
    setLoading(false);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Payment Details</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Card Holder Name</Form.Label>
            <Form.Control
              type="text"
              value={paymentForm.cardHolderName}
              onChange={(e) => setPaymentForm({ ...paymentForm, cardHolderName: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              value={paymentForm.cardNumber}
              onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
              pattern="[0-9]{16}"
              maxLength="16"
              required
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  pattern="[0-9]{3,4}"
                  maxLength="4"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2">
            <Button className="mr-2" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Processing..." : `Pay $${amount}`}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

function Account() {
  const [credits, setCredits] = useState(0);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      const userCredits = await ApiService.getUserCredits(user.id);
      setCredits(userCredits);
      setError("");
    } catch (error) {
      console.error("Error fetching credits:", error);
      setError("Failed to fetch credits. Please try again.");
    }
  };

  const handleAddCredits = () => {
    setShowAddCredits(true);
    setError("");
    setSuccess("");
  };

  const handleNext = (amount) => {
    setCreditsToAdd(amount);
    setShowAddCredits(false);
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (paymentDetails) => {
    setError("");
    setSuccess("");
    try {
      const user = await ApiService.getCurrentUser();
      const paymentData = {
        userId: user.id,
        amount: parseInt(creditsToAdd),
        paymentDetails: {
          cardHolderName: paymentDetails.cardHolderName,
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv
        }
      };

      await ApiService.processPayment(paymentData);
      await fetchUserCredits();
      setShowPayment(false);
      setCreditsToAdd("");
      setSuccess("Payment processed successfully! Credits have been added to your account.");
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Failed to process payment. Please try again.");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title>Account Balance</Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <div className="d-flex justify-content-between align-items-center">
                <h3>Current Credits: {credits}</h3>
                <Button variant="primary" onClick={handleAddCredits}>Add Credits+</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddCreditsPanel
        show={showAddCredits}
        onClose={() => setShowAddCredits(false)}
        onNext={handleNext}
      />

      <PaymentPanel
        show={showPayment}
        onClose={() => setShowPayment(false)}
        amount={creditsToAdd}
        onSubmit={handlePaymentSubmit}
      />
    </Container>
  );
}

export default Account;