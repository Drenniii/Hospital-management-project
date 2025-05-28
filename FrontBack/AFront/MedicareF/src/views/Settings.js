import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert
} from "react-bootstrap";
import ApiService from "../service/ApiService";

function Settings() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmationPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check token on component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Current token:", token ? "Token exists" : "No token found");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed`); // Log field changes
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    console.log("Form submitted with values:", {
      currentPassword: passwords.currentPassword ? "exists" : "missing",
      newPassword: passwords.newPassword ? "exists" : "missing",
      confirmationPassword: passwords.confirmationPassword ? "exists" : "missing"
    });
    
    // Basic validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmationPassword) {
      console.log("Validation failed: missing fields");
      setError("All fields are required");
      return;
    }
    console.log("All fields present");

    if (passwords.newPassword !== passwords.confirmationPassword) {
      console.log("Validation failed: passwords don't match");
      setError("Passwords are not the same");
      return;
    }
    console.log("Passwords match");

    if (passwords.newPassword.length < 6) {
      console.log("Validation failed: password too short");
      setError("New password must be at least 6 characters long");
      return;
    }
    console.log("Password length valid");

    try {
        console.log("Starting API call process");
        const token = localStorage.getItem("accessToken");
        console.log("Token being used:", token ? "Token exists" : "No token");
        
        console.log("Making API call to change password...");
        const response = await ApiService.changePassword({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmationPassword: passwords.confirmationPassword
        });
        console.log('Password change response:', response);
        
        // Check if response has the success message
        const successMessage = response.message || "Password changed successfully!";
        console.log('Setting success message:', successMessage);
        setSuccess(successMessage);
        
        // Clear form
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmationPassword: ""
        });
        console.log('Form cleared');

        // Force re-render of success message
        setTimeout(() => {
          setSuccess(successMessage);
        }, 0);
      } catch (err) {
        console.error('Password change error:', err);
        console.log('Full error object:', {
          message: err.message,
          response: err.response,
          request: err.request
        });
        if (err.response) {
          console.log('Error response data:', err.response.data);
          console.log('Error response status:', err.response.status);
          const errorMessage = err.response.data.message || err.response.data || "Failed to change password";
          setError(errorMessage);
        } else if (err.request) {
          console.log('No response received:', err.request);
          setError("No response from server");
        } else {
          console.log('Error setting up request:', err.message);
          setError("Error setting up request");
        }
      }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col className="pr-1" md="12">
                    <h5>Change Password</h5>
                    {error && (
                      <Alert variant="danger" className="mt-3 mb-3" show={!!error}>
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert variant="success" className="mt-3 mb-3" show={!!success}>
                        {success}
                      </Alert>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Current Password</label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>New Password</label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Confirm New Password</label>
                      <Form.Control
                        type="password"
                        name="confirmationPassword"
                        value={passwords.confirmationPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="info"
                >
                  Change Password
                </Button>
                <div className="clearfix"></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Settings; 