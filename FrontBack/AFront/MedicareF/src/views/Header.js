import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Header() {
    return (
        <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                <a className="navbar-brand fw-bold text-primary" href="/">MediCare+</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#services">Services</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#faq">FAQ</a>
                        </li>
                        <li className="nav-item">
                            <a className="btn btn-outline-primary ms-3" href="/LoginPage.js">LogIn</a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
