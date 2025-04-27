import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    // Simulojmë dërgimin e email-it
    console.log('Password reset email sent to:', email);
    setMessage('If this email exists, a reset link will be sent shortly.');
    setEmail('');
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
          <h3 className="mb-3 text-center">Forgot Password</h3>
          <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Enter your email and we’ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                placeholder="Email address"
                value={email}
                onChange={handleChange}
              />
              {error && <div className="invalid-feedback">{error}</div>}
              {message && <div className="text-success mt-2" style={{ fontSize: '0.9rem' }}>{message}</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">Send Reset Link</button>
          </form>
          <div className="mt-3 text-center">
            <small className="text-muted">Remember your password? <a href="/Login">LogIn</a></small>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ForgetPassword;