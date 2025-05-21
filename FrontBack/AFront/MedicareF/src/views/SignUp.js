import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import Footer from './Footer';
import ApiService from 'service/ApiService';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: '',   // Fixed: use 'firstname'
    lastname: '',    // Fixed: use 'lastname'
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const history = useHistory(); // Hook to navigate

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validate = () => {
    let errs = {};
    if (!formData.firstname) errs.firstname = 'First name is required';
    if (!formData.lastname) errs.lastname = 'Last name is required';
    if (!formData.email) errs.email = 'Email is required';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      try {
        const response = await ApiService.registerUser(formData);
        console.log('Sign up successful:', response);
        history.push('/login');
      } catch (error) {
        console.error('Error signing up:', error);

        if (error.response && error.response.status === 400) {
          // Show specific error returned by the backend (like email already registered)
          setErrors({ general: error.response.data || 'Invalid input' });
        } else {
          setErrors({ general: 'Signup failed. Please try again later.' });
        }
      }
    }
  };

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold text-primary" href="/">MediCare+</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </header>

      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
          <h3 className="mb-3 text-center">Sign Up</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                id="firstname"
                name="firstname"
                value={formData.firstname}
                placeholder="First Name"
                onChange={handleChange}
              />
              {errors.firstname && <div className="invalid-feedback">{errors.firstname}</div>}
            </div>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                id="lastname"
                name="lastname"
                value={formData.lastname}
                placeholder="Last Name"
                onChange={handleChange}
              />
              {errors.lastname && <div className="invalid-feedback">{errors.lastname}</div>}
            </div>
            <div className="mb-3">
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                placeholder="Email address"
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            {errors.general && <div className="text-danger text-center">{errors.general}</div>}
            <button type="submit" className="btn btn-primary w-100 mt-4">Sign Up</button>
          </form>
          <div className="mt-3 text-center">
            <small className="text-muted">Already have an account? <a href="/login">Log In</a></small>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;