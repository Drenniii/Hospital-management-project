import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Container, Row, Col, Button, Spinner, Alert, Modal } from "react-bootstrap";

function TableList() {
  const [klientet, setKlientet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedKlient, setSelectedKlient] = useState(null);

  useEffect(() => {
    axios.get("/api/terapist/klientet")
      .then(res => {
        setKlientet(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gabim:", err);
        setError("Nuk mund të ngarkohen të dhënat e klientëve.");
        setLoading(false);
      });
  }, []);

  const handleShowModal = (klient) => {
    setSelectedKlient(klient);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedKlient(null);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md="12">
          <Card>
            <Card.Header className="bg-primary text-white">
              <Card.Title as="h4" className="mb-0">Klientët e mi</Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : klientet.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Emri</th>
                      <th>Mbiemri</th>
                      <th>Detaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {klientet.map((klient, index) => (
                      <tr key={klient.id}>
                        <td>{index + 1}</td>
                        <td>{klient.emri}</td>
                        <td>{klient.mbiemri}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowModal(klient)}
                          >
                            Shiko
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nuk ka klientë për t'u shfaqur.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal për shfaqjen e detajeve të klientit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detajet e Klientit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedKlient && (
            <>
              <p><strong>Emri:</strong> {selectedKlient.emri}</p>
              <p><strong>Mbiemri:</strong> {selectedKlient.mbiemri}</p>
              <p><strong>Email:</strong> {selectedKlient.email}</p>
              <p><strong>Telefon:</strong> {selectedKlient.telefon}</p>
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
