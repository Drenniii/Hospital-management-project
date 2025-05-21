import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import ApiService from "service/ApiService";

// Një stil minimal për "modal" div-in
const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
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

function ViewUserPanel({ user, show, onClose }) {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Detajet e Përdoruesit</h4>
        {user ? (
          <>
            <p><strong>Emri:</strong> {user.firstname}</p>
            <p><strong>Mbiemri:</strong> {user.lastname}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        ) : (
          <p>Nuk ka të dhëna për t'u shfaqur.</p>
        )}
        <Button variant="secondary" onClick={onClose}>Mbyll</Button>
      </div>
    </div>
  );
}

function EditUserPanel({ user, show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert("Gabim gjatë përditësimit të përdoruesit.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Ndrysho Përdoruesin</h4>
        <Form>
          <Form.Group className="mb-3" controlId="firstname">
            <Form.Label>Emri</Form.Label>
            <Form.Control
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lastname">
            <Form.Label>Mbiemri</Form.Label>
            <Form.Control
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={saving}
            />
          </Form.Group>
        </Form>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onClose} disabled={saving} className="me-2">
            Anulo
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Duke ruajtur..." : "Ruaj"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TableList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [viewPanelVisible, setViewPanelVisible] = useState(false);
  const [editPanelVisible, setEditPanelVisible] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await ApiService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
        setError("Nuk mund të ngarkohen të dhënat e përdoruesve.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const openViewPanel = (user) => {
    setSelectedUser(user);
    setViewPanelVisible(true);
  };

  const closeViewPanel = () => {
    setSelectedUser(null);
    setViewPanelVisible(false);
  };

  const openEditPanel = (user) => {
    setSelectedUser(user);
    setEditPanelVisible(true);
  };

  const closeEditPanel = () => {
    setSelectedUser(null);
    setEditPanelVisible(false);
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `A jeni i sigurt që dëshironi të fshini ${user.firstname} ${user.lastname}?`
    );
    if (!confirmDelete) return;

    try {
      await ApiService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("Gabim gjatë fshirjes së përdoruesit:", err);
      alert("Nuk mund të fshihet përdoruesi.");
    }
  };

  const handleSaveUser = async (updatedData) => {
    if (!selectedUser) return;
    try {
      const updatedUser = await ApiService.updateUser(selectedUser.id, updatedData);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
    } catch (err) {
      throw err; // handled in panel
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
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
              ) : users.length === 0 ? (
                <Alert variant="info">Nuk ka përdorues për t'u shfaqur.</Alert>
              ) : (
                <Table striped bordered responsive>
                  <thead className="table-dark">
                    <tr>
                      <th className="text-white">#</th>
                      <th className="text-white">Emri</th>
                      <th className="text-white">Mbiemri</th>
                      <th className="text-white">Email</th>
                      <th className="text-white">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id}>
                        <td>{idx + 1}</td>
                        <td>{user.firstname}</td>
                        <td>{user.lastname}</td>
                        <td>{user.email}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            // className="me-2"
                            style={{ marginRight: '14px' }}
                            onClick={() => openViewPanel(user)}
                          >
                            Shiko
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            // className="me-2"
                            style={{ marginRight: '14px' }}
                            onClick={() => openEditPanel(user)}
                          >
                            Ndrysho
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Fshi
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ViewUserPanel
        user={selectedUser}
        show={viewPanelVisible}
        onClose={closeViewPanel}
      />

      <EditUserPanel
        user={selectedUser}
        show={editPanelVisible}
        onClose={closeEditPanel}
        onSave={handleSaveUser}
      />
    </Container>
  );
}
//az

export default TableList;
