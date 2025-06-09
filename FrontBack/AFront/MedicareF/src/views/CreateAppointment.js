import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import ApiService from 'service/ApiService';

function CreateAppointment({ onHide, onAppointmentCreated }) {
  console.log('CreateAppointment component initialized');

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    professionalId: '',
    appointmentDateTime: '',
    type: 'THERAPY',
    notes: ''
  });

  useEffect(() => {
    console.log('CreateAppointment useEffect triggered - Loading data');
    loadInitialData();
  }, []); // Remove show dependency since we don't use it anymore

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load both current user and professionals in parallel
      const [user, therapists, nutritionists] = await Promise.all([
        ApiService.getCurrentUser(),
        ApiService.getAllTherapists(),
        ApiService.getAllNutritionists()
      ]);

      console.log('Current user loaded:', user);
      console.log('Therapists loaded:', therapists);
      console.log('Nutritionists loaded:', nutritionists);

      setCurrentUser(user);

      const allProfessionals = [...(therapists || []), ...(nutritionists || [])];
      console.log('Combined professionals:', allProfessionals);

      if (allProfessionals.length === 0) {
        setError('No professionals available for appointments');
      } else {
        setProfessionals(allProfessionals);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load necessary data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', { 
      field: name, 
      value, 
      valueType: typeof value
    });
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!currentUser) {
      setError('User information not loaded. Please try again.');
      return;
    }

    if (!formData.professionalId) {
      setError('Please select a professional');
      return;
    }

    if (!formData.appointmentDateTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format the date properly for the backend, preserving the local time
      const dateObj = new Date(formData.appointmentDateTime);
      // Add the timezone offset to keep the local time when converting to ISO string
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formattedDate = new Date(dateObj.getTime() - userTimezoneOffset)
        .toISOString()
        .replace('Z', '');

      console.log('Sending appointment data:', {
        clientId: currentUser.id,
        professionalId: formData.professionalId,
        appointmentDateTime: formattedDate,
        type: formData.type,
        notes: formData.notes || ""
      });

      // Create the appointment
      const result = await ApiService.createAppointment(
        currentUser.id,
        formData.professionalId,
        formattedDate,
        formData.type,
        formData.notes || ""
      );

      console.log('Appointment created successfully:', result);
      
      // Clear form
      setFormData({
        professionalId: '',
        appointmentDateTime: '',
        type: 'THERAPY',
        notes: ''
      });
      
      // Show success message before closing
      alert('Appointment created successfully!');
      onAppointmentCreated();
    } catch (err) {
      console.error('Error creating appointment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create appointment';
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get current date and time in the format required by datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  console.log('Rendering CreateAppointment form with professionals:', professionals.length);

  if (loading && !professionals.length) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Professional</Form.Label>
          <Form.Select
            name="professionalId"
            value={formData.professionalId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a professional</option>
            {professionals.map(prof => (
              <option key={prof.id} value={prof.id}>
                {prof.firstname} {prof.lastname} ({prof.role === 'THERAPIST' ? 'Therapist' : 'Nutritionist'})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date and Time</Form.Label>
          <Form.Control
            type="datetime-local"
            name="appointmentDateTime"
            value={formData.appointmentDateTime}
            onChange={handleChange}
            min={getCurrentDateTime()}
            required
            disabled={loading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="THERAPY">Therapy</option>
            <option value="NUTRITION">Nutrition</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notes (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button 
            variant="secondary" 
            onClick={onHide} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating...
              </>
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </div>
      </Form>
    </>
  );
}

export default CreateAppointment; 