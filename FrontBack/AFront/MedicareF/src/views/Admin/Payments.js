import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Button,
} from "react-bootstrap";
import ApiService from "service/ApiService";
import { jsPDF } from "jspdf";

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

  const downloadPDF = () => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF('landscape');  // Changed to landscape for better table fit
      
      // Add title
      doc.setFontSize(16);
      doc.text('Payment History Report', 14, 15);
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      
      // Set up table headers
      const headers = ['ID', 'Amount', 'Card Holder', 'Last 4 Digits', 'Status', 'Date', 'User ID'];
      let yPos = 35;
      const lineHeight = 7;
      const colWidth = 35; // Increased column width for better spacing
      
      // Add headers with lines
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Draw header background
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, headers.length * colWidth + 4, 8, 'F');
      
      // Add header text
      headers.forEach((header, index) => {
        doc.text(header, 14 + (index * colWidth), yPos);
      });
      
      // Add horizontal line under headers
      yPos += 2;
      doc.line(10, yPos, headers.length * colWidth + 14, yPos);
      yPos += 5;
      
      // Add data rows
      doc.setFont('helvetica', 'normal');
      
      payments.forEach((payment, rowIndex) => {
        if (yPos > 180) { // Check if we need a new page (adjusted for landscape)
          doc.addPage('landscape');
          yPos = 20;
          
          // Redraw headers on new page
          doc.setFont('helvetica', 'bold');
          headers.forEach((header, index) => {
            doc.text(header, 14 + (index * colWidth), yPos);
          });
          doc.line(10, yPos + 2, headers.length * colWidth + 14, yPos + 2);
          yPos += 10;
          doc.setFont('helvetica', 'normal');
        }
        
        // Add row background for alternating rows
        if (rowIndex % 2 === 0) {
          doc.setFillColor(249, 249, 249);
          doc.rect(10, yPos - 5, headers.length * colWidth + 4, lineHeight, 'F');
        }
        
        const row = [
          payment.id.toString(),
          `$${payment.amount?.toFixed(2)}`,
          payment.cardHolderName || 'N/A',
          payment.lastFourDigits || 'N/A',
          payment.status,
          formatDate(payment.timestamp),
          payment.user?.id || payment.userId || 'N/A'
        ];
        
        row.forEach((cell, index) => {
          // Ensure cell text doesn't exceed column width
          const text = cell.toString();
          const maxWidth = colWidth - 4;
          if (doc.getTextWidth(text) > maxWidth) {
            doc.setFontSize(8); // Reduce font size for long text
          } else {
            doc.setFontSize(10);
          }
          doc.text(text, 14 + (index * colWidth), yPos);
        });
        
        yPos += lineHeight;
      });

      // Save the PDF
      doc.save('payment-history.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
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
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title as="h4">Payment History</Card.Title>
                <p className="card-category">Complete list of all payments</p>
              </div>
              <Button variant="primary" onClick={downloadPDF}>
                <i className="fas fa-download me-2"></i>
                Download PDF
              </Button>
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