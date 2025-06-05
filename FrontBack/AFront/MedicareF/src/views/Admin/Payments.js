import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
} from "react-bootstrap";
import ApiService from "service/ApiService";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllPayments();
      setPayments(response || []);
      setError(null);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
          {error}
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
              <Card.Title as="h4">Payment History</Card.Title>
              <p className="card-category">Complete list of all payments</p>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount ($)</th>
                    <th>Card Holder</th>
                    <th>Last 4 Digits</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{payment.amount?.toFixed(2)}</td>
                      <td>{payment.cardHolderName || 'N/A'}</td>
                      <td>{payment.lastFourDigits || 'N/A'}</td>
                      <td>
                        <span className={`badge ${payment.status === 'PAID' ? 'bg-success' : 'bg-warning'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{formatDate(payment.timestamp)}</td>
                      <td>{payment.user?.id || payment.userId || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Payments;
