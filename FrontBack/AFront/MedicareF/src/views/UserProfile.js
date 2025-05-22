import React, { useEffect, useState } from "react";
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

function User() {
  const [formData, setFormData] = useState({
    id: "",
    firstname: "",
    lastname: "",
    email: "",
    country: "",
    city: "",
    about: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ApiService.getCurrentUser()
      .then((data) => {
        console.log("User data from API:", data);
        setFormData({
          id: data.id || "",
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          country: data.country || "",
          city: data.city || "",
          about: data.about || ""
        });
      })
      .catch((error) => {
        console.error("Gabim gjatë marrjes së të dhënave:", error);
        setError("Nuk u morën të dhënat e përdoruesit.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    ApiService.updateUserProfile(formData.id, formData)
      .then(() => {
        setMessage("Profili u përditësua me sukses.");
      })
      .catch((error) => {
        console.error("Gabim gjatë përditësimit:", error);
        setError("Gabim gjatë përditësimit të profilit.");
      });
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Edit Profile</Card.Title>
            </Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <label>First Name</label>
                      <Form.Control
                        name="firstname"
                        type="text"
                        value={formData.firstname}
                        onChange={handleChange}
                        placeholder="First Name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group>
                      <label>Last Name</label>
                      <Form.Control
                        name="lastname"
                        type="text"
                        value={formData.lastname}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Email address</label>
                      <Form.Control
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        readOnly // zakonisht nuk lejohet ndryshimi i email-it
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <label>Country</label>
                      <Form.Control
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group>
                      <label>City</label>
                      <Form.Control
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>About Me</label>
                      <Form.Control
                        name="about"
                        as="textarea"
                        rows="4"
                        value={formData.about}
                        onChange={handleChange}
                        placeholder="Here can be your description"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button className="btn-fill pull-right" type="submit" variant="info">
                  Update Profile
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

export default User;
