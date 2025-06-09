import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form } from "react-bootstrap";
import ApiService from "service/ApiService";

function AdminDashboard() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [nutricists, setNutricists] = useState([]);
  const [editPanelVisible, setEditPanelVisible] = useState(false);
  const [createPanelVisible, setCreatePanelVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await ApiService.getAllUsers();
      setAllUsers(fetchedUsers);
      updateFilteredLists(fetchedUsers);
    } catch (error) {
      console.error("Gabim gjatë marrjes së përdoruesve:", error);
    }
  };

  const updateFilteredLists = (users) => {
    setUsers(users.filter((user) => user.role === "USER"));
    setTherapists(users.filter((user) => user.role === "THERAPIST"));
    setNutricists(users.filter((user) => user.role === "NUTRICIST"));
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("A jeni i sigurt që doni të fshini këtë përdorues?")) return;

    try {
      await ApiService.deleteUser(userId);
      const updatedUsers = allUsers.filter((user) => user.id !== userId);
      setAllUsers(updatedUsers);
      updateFilteredLists(updatedUsers);
    } catch (error) {
      console.error("Gabim gjatë fshirjes së përdoruesit:", error);
    }
  };

  const openEditPanel = (user) => {
    setSelectedUser(user);
    setEditPanelVisible(true);
  };

  const closeEditPanel = () => {
    setSelectedUser(null);
    setEditPanelVisible(false);
  };

  const openCreatePanel = () => setCreatePanelVisible(true);
  const closeCreatePanel = () => setCreatePanelVisible(false);

  const handleUpdateUser = async (updatedUser) => {
    try {
      await ApiService.updateUser(updatedUser.id, updatedUser);
      const updatedUsers = allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      setAllUsers(updatedUsers);
      updateFilteredLists(updatedUsers);
      closeEditPanel();
    } catch (error) {
      console.error("Gabim gjatë përditësimit të përdoruesit:", error);
    }
  };

  const handleCreateUser = async (newUser) => {
    try {
      const created = await ApiService.registerUser(newUser);
      const updated = [...allUsers, created];
      setAllUsers(updated);
      updateFilteredLists(updated);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={openCreatePanel}>+ Shto Përdorues</Button>
      </div>
      <UserTable title="Përdoruesit" users={users} onEdit={openEditPanel} onDelete={handleDelete} />
      <UserTable title="Terapeutët" users={therapists} onEdit={openEditPanel} onDelete={handleDelete} />
      <UserTable title="Nutricistët" users={nutricists} onEdit={openEditPanel} onDelete={handleDelete} />
      {editPanelVisible && selectedUser && (
        <EditUserPanel user={selectedUser} onClose={closeEditPanel} onSave={handleUpdateUser} />
      )}
      {createPanelVisible && (
        <CreateUserPanel show={createPanelVisible} onClose={closeCreatePanel} onCreate={handleCreateUser} />
      )}
    </div>
  );
}

function UserTable({ title, users, onEdit, onDelete }) {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Emri</th>
              <th>Mbiemri</th>
              <th>Email</th>
              <th>Roli</th>
              <th>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => onEdit(user)} className="me-2" style={{ marginRight: '14px' }}>
                    Ndrysho
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(user.id)}>
                    Fshij
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

function EditUserPanel({ user, onClose, onSave }) {
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => onSave(formData);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Ndrysho Përdoruesin</h4>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Emri</Form.Label>
            <Form.Control name="firstname" value={formData.firstname} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mbiemri</Form.Label>
            <Form.Control name="lastname" value={formData.lastname} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Roli</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange}>
              <option value="USER">USER</option>
              <option value="THERAPIST">THERAPIST</option>
              <option value="NUTRICIST">NUTRICIST</option>
            </Form.Select>
          </Form.Group>
        </Form>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onClose} className="me-2">
            Anulo
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Ruaj
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateUserPanel({ show, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onCreate(formData);
      onClose();
    } catch (err) {
      alert("Gabim gjatë krijimit të përdoruesit.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Krijo Përdorues të Ri</h4>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Emri</Form.Label>
            <Form.Control name="firstname" value={formData.firstname} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mbiemri</Form.Label>
            <Form.Control name="lastname" value={formData.lastname} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fjalëkalimi</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Roli</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange}>
              <option value="USER">USER</option>
              <option value="THERAPIST">THERAPIST</option>
              <option value="NUTRICIST">NUTRICIST</option>
            </Form.Select>
          </Form.Group>
        </Form>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onClose} className="me-2" disabled={saving}>
            Anulo
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Duke ruajtur..." : "Krijo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
};

export default AdminDashboard; //admin