import Admin from "layouts/Admin";
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

// Modal Styles
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

function UserTable({ title, userList, openViewPanel, openEditPanel, handleDeleteUser }) {
  return (
    <Card className="mb-4">
      <Card.Header className="bg-secondary text-white">
        <Card.Title as="h5" className="mb-0">{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        {userList.length === 0 ? (
          <Alert variant="info">Nuk ka të dhëna për këtë kategori.</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Emri</th>
                <th>Mbiemri</th>
                <th>Email</th>
                <th>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, idx) => (
                <tr key={user.id}>
                  <td>{idx + 1}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.email}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => openViewPanel(user)}
                    >
                      Shiko
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
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
  );
}

function AdminDashboard() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [nutricists, setNutricists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [viewPanelVisible, setViewPanelVisible] = useState(false);
  const [editPanelVisible, setEditPanelVisible] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await ApiService.getAllUsers();
        setAllUsers(data);
        setUsers(data.filter((u) => u.role === "USER"));
        setTherapists(data.filter((u) => u.role === "THERAPIST"));
        setNutricists(data.filter((u) => u.role === "NUTRICIST"));
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

  const updateFilteredLists = (updatedList) => {
    setUsers(updatedList.filter((u) => u.role === "USER"));
    setTherapists(updatedList.filter((u) => u.role === "THERAPIST"));
    setNutricists(updatedList.filter((u) => u.role === "NUTRICIST"));
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `A jeni i sigurt që dëshironi të fshini ${user.firstname} ${user.lastname}?`
    );
    if (!confirmDelete) return;

    try {
      await ApiService.deleteUser(user.id);
      const updated = allUsers.filter((u) => u.id !== user.id);
      setAllUsers(updated);
      updateFilteredLists(updated);
    } catch (err) {
      console.error("Gabim gjatë fshirjes së përdoruesit:", err);
      alert("Nuk mund të fshihet përdoruesi.");
    }
  };

  const handleSaveUser = async (updatedData) => {
    if (!selectedUser) return;
    try {
      const updatedUser = await ApiService.updateUser(selectedUser.id, updatedData);
      const updated = allUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      );
      setAllUsers(updated);
      updateFilteredLists(updated);
    } catch (err) {
      throw err;
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <Card.Title as="h4" className="mb-0">Përdoruesit e Sistemës</Card.Title>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <UserTable
                    title="Përdoruesit (USER)"
                    userList={users}
                    openViewPanel={openViewPanel}
                    openEditPanel={openEditPanel}
                    handleDeleteUser={handleDeleteUser}
                  />
                  <UserTable
                    title="Nutricistët (NUTRICIST)"
                    userList={nutricists}
                    openViewPanel={openViewPanel}
                    openEditPanel={openEditPanel}
                    handleDeleteUser={handleDeleteUser}
                  />
                  <UserTable
                    title="Terapistët (THERAPIST)"
                    userList={therapists}
                    openViewPanel={openViewPanel}
                    openEditPanel={openEditPanel}
                    handleDeleteUser={handleDeleteUser}
                  />
                </>
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

export default AdminDashboard;