import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validate = () => {
    let errs = {};
    if (!formData.firstName) errs.firstName = 'First name is required';
    if (!formData.lastName) errs.lastName = 'Last name is required';
    if (!formData.email) errs.email = 'Email is required';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      // Submit logic
      console.log('Signing up with:', formData);
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
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                id="firstName"
                name="firstName"
                value={formData.firstName}
                placeholder="First Name"
                onChange={handleChange}
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                id="lastName"
                name="lastName"
                value={formData.lastName}
                placeholder="Last Name"
                onChange={handleChange}
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
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
            <button type="submit" className="btn btn-primary w-100 mt-4">Sign Up</button>
          </form>
          <div className="mt-3 text-center">
            <small className="text-muted">Already have an account? <a href="/signin">Sign In</a></small>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;
