import React, { useEffect, useState } from "react";
import { Card, Table, Container, Row, Col, Button, Spinner, Alert, Modal } from "react-bootstrap";
import ApiService from "service/ApiService";

function TableList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    ApiService.getAllUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err.response ? err.response.data : err.message);
        setError("Nuk mund të ngarkohen të dhënat e përdoruesve.");
        setLoading(false);
      });
  }, []);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md="12">
          <Card>
            <Card.Header className="bg-primary text-white">
              <Card.Title as="h4" className="mb-0">Përdoruesit</Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : users.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Emri</th>
                      <th>Mbiemri</th>
                      <th>Email</th>
                      <th>Detaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.firstname}</td>
                        <td>{user.lastname}</td>
                        <td>{user.email}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowModal(user)}
                          >
                            Shiko
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nuk ka përdorues për t'u shfaqur.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal për shfaqjen e detajeve të përdoruesit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detajet e Përdoruesit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><strong>Emri:</strong> {selectedUser.firstname}</p>
              <p><strong>Mbiemri:</strong> {selectedUser.lastname}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Mbyll
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TableList;
