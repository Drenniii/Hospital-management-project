import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/LandingPage.css';
import Header from './Header';
import Footer from './Footer';

export default function LandingPage() {
    return (
        <>
            <Header />
            <main>

                {/* Section 1: Hero */}
                <div className="section section-hero text-center">
                    <div className="container">
                        <h1 className="display-4 fw-bold">You deserve to be happy.</h1>
                        <p className="lead">What type of therapy are you looking for?</p>

                        <div className="row mt-4">
                            <div className="col-12 col-sm-6 col-md-4 mb-3">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h4 className="card-title">Individual</h4>
                                        <a href="/get-started" className="btn btn-primary mt-2">For myself →</a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 mb-3">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h4 className="card-title">Couples</h4>
                                        <a href="/get-started" className="btn btn-primary mt-2">For me and my partner →</a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-4 mb-3">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h4 className="card-title">Teen</h4>
                                        <a href="/get-started" className="btn btn-primary mt-2">For my child →</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1.5: Info Boxes */}
                <div className="section section-info">
                    <div className="container">
                        <div className="row text-center g-4">
                            <div className="col-12 col-md-4 mb-4 mb-md-0">
                                <div className="p-4 bg-primary rounded text-white shadow-sm h-100">
                                    <h5>Affordable & Accessible</h5>
                                    <p>Get therapy on your schedule, from anywhere.</p>
                                    <a href="/get-started" className="text-white text-decoration-underline d-block mt-2">Learn more →</a>
                                </div>
                            </div>
                            <div className="col-12 col-md-4 mb-4 mb-md-0">
                                <div className="p-4 bg-dark rounded text-white shadow-sm h-100">
                                    <h5>Licensed Professionals</h5>
                                    <p>Work with qualified, experienced therapists.</p>
                                    <a href="/get-started" className="text-white text-decoration-underline d-block mt-2">Learn more →</a>
                                </div>
                            </div>
                            <div className="col-12 col-md-4 mb-4 mb-md-0">
                                <div className="p-4 bg-warning rounded text-white shadow-sm h-100">
                                    <h5>Confidential & Secure</h5>
                                    <p>Your privacy is our top priority.</p>
                                    <a href="/get-started" className="text-white text-decoration-underline d-block mt-2">Learn more →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Stats */}
                <div className="section section-stats">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6 text-center text-md-start">
                                <h1 className="fw-bold">The world's largest <br /> therapy service.</h1>
                                <h2 className="text-primary mt-3">100% online.</h2>
                            </div>
                            <div className="col-12 col-md-6 text-center">
                                <h1 className="display-6">380,418,761</h1>
                                <p>Messages, chat, phone, video sessions</p>
                                <hr />
                                <h1 className="display-6">35,803</h1>
                                <p>Licensed therapists</p>
                                <hr />
                                <h1 className="display-6">4,747,193</h1>
                                <p>Successful connections</p>
                                <hr />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Therapists */}
                <div className="section section-therapists">
                    <div className="container">
                        <div className="row align-items-center justify-content-center">
                            <div className="col-12 col-md-8 mb-4 mb-md-0">
                                <h1 className="fw-bold text-center text-md-start">
                                    Professional and credentialed therapists you can trust
                                </h1>
                                <p className="mt-3 text-center text-md-start">
                                    Tap into the world's largest network of credentialed and experienced therapists who can help you with a range of issues including depression, anxiety, relationships, trauma, grief, and more.
                                </p>
                            </div>
                            <div className="col-12 col-md-4 text-center">
                                <a href="/get-started" className="btn btn-success btn-lg py-3 px-5 fw-bold">Get matched to a therapist</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Comparison Table */}
                <div className="section section-compare">
                    <div className="container">
                        <h2 className="text-center mb-4">
                            <span className="text-primary">MediCare+ vs. traditional in-office therapy</span>
                        </h2>

                        <div className="table-responsive">
                            <table className="table table-bordered text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>Feature</th>
                                        <th>MediCare+</th>
                                        <th>In-office</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Provided by a credentialled therapist', '✔', '✔'],
                                        ['In-office visits', '✖', '✔'],
                                        ['Messaging any time', '✔', '✖'],
                                        ['Chat sessions', '✔', '✖'],
                                        ['Phone sessions', '✔', '✖'],
                                        ['Video sessions', '✔', '✖'],
                                        ['Easy scheduling', '✔', '✖'],
                                        ['Digital worksheets', '✔', '✖'],
                                        ['Group sessions', '✔', '?'],
                                        ['Smart provider matching', '✔', '✖'],
                                        ['Easy to switch providers', '✔', '✖'],
                                        ['Access therapy from anywhere', '✔', '✖']
                                    ].map(([feature, online, inOffice], i) => (
                                        <tr key={i}>
                                            <td className="text-start">{feature}</td>
                                            <td className={online === '✔' ? 'text-success' : online === '✖' ? 'text-danger' : ''}>{online}</td>
                                            <td className={inOffice === '✔' ? 'text-success' : inOffice === '✖' ? 'text-danger' : ''}>{inOffice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </>
    );
}
