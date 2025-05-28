import React from "react";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

function UserDashboard() {
  const history = useHistory();

  return (
    <>
      <Container fluid>
        <Row className="mb-4">
          <Col md="12">
            <h4>Welcome to MediCare+</h4>
            <p>Choose the service you need</p>
          </Col>
        </Row>
        <Row>
          <Col md="6" className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-primary">Physical Therapy</Card.Title>
                <Card.Text>
                  Get personalized physical therapy sessions with our expert therapists.
                  We offer:
                  <ul>
                    <li>Professional physical assessment</li>
                    <li>Customized treatment plans</li>
                    <li>Rehabilitation programs</li>
                    <li>Progress monitoring</li>
                  </ul>
                </Card.Text>
                <div className="mt-auto">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => history.push("/admin/therapist-selection")}
                    className="w-100"
                  >
                    Find a Therapist
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6" className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-success">Nutrition Consultation</Card.Title>
                <Card.Text>
                  Get expert dietary advice from our certified nutritionists.
                  We offer:
                  <ul>
                    <li>Personalized meal plans</li>
                    <li>Dietary assessments</li>
                    <li>Nutritional counseling</li>
                    <li>Weight management programs</li>
                  </ul>
                </Card.Text>
                <div className="mt-auto">
                  <Button 
                    variant="outline-success" 
                    onClick={() => history.push("/admin/nutritionist-selection")}
                    className="w-100"
                  >
                    Find a Nutritionist
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default UserDashboard; 