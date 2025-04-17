import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/Footer.css';

export default function Footer() {
    return (
        <footer className="bg-primary text-white py-4">
            <div className="container">
                <div className="row text-center text-md-start">
                    <div className="col-md-4 mb-3">
                        <h5 className="fw-bold">MediCare+</h5>
                        <p>Helping you find the support you need, anytime, anywhere.</p>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h6 className="fw-bold">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><a href="#services" className="footer-link">Services</a></li>
                            <li><a href="#faq" className="footer-link">FAQ</a></li>
                            <li><a href="/get-started" className="footer-link">Get Started</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h6 className="fw-bold">Contact</h6>
                        <p>Email: support@medicareplus.com</p>
                        <p>Phone: +383 44 123 456</p>
                    </div>
                </div>
                <hr className="border-light" />
                <p className="text-center mb-0">&copy; {new Date().getFullYear()} MediCare+. All rights reserved.</p>
            </div>
        </footer>
    );
}
