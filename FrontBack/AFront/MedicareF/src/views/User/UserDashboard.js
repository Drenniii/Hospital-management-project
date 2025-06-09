import React from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
  const history = useHistory();

  return (
    <>
      <Container fluid>
        <Row className="mb-4">
          <Col md="12">
            <div className="welcome-section text-center mb-5">
              <h2 className="mb-3">Welcome to MediCare+</h2>
              <p className="text-muted">Select a service to get started</p>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="6" lg="5" className="mb-4">
            <Card className="service-card h-100">
              <Card.Body className="p-4">
                <div className="service-icon mb-4">
                  <i className="fas fa-brain fa-2x"></i>
                </div>
                <Card.Title className="h4 mb-3">Physical Therapy</Card.Title>
                <Card.Text className="mb-4">
                  Get professional physical therapy treatment from our experienced therapists.
                </Card.Text>
                <ul className="feature-list mb-4">
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Initial Assessment
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Treatment Planning
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Recovery Support
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Progress Tracking
                  </li>
                </ul>
                <Button 
                  onClick={() => history.push("/admin/therapist-selection")}
                  variant="primary"
                  className="w-100"
                >
                  <i className="fas fa-user-md me-2"></i>
                  Find Therapist
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md="6" lg="5" className="mb-4">
            <Card className="service-card h-100">
              <Card.Body className="p-4">
                <div className="service-icon mb-4">
                  <i className="fas fa-apple-alt fa-2x"></i>
                </div>
                <Card.Title className="h4 mb-3">Nutrition Consultation</Card.Title>
                <Card.Text className="mb-4">
                  Get professional dietary advice and nutrition plans from our experts.
                </Card.Text>
                <ul className="feature-list mb-4">
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Meal Planning
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Diet Assessment
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Nutrition Advice
                  </li>
                  <li>
                    <i className="fas fa-check me-2"></i>
                    Health Goals
                  </li>
                </ul>
                <Button 
                  onClick={() => history.push("/admin/nutritionist-selection")}
                  variant="success"
                  className="w-100"
                >
                  <i className="fas fa-leaf me-2"></i>
                  Find Nutritionist
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default UserDashboard; 