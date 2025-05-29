import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import './Psychology.css';

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
  width: "90%",
  maxWidth: "1200px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

const Psychology = ({ show, onHide }) => {
  if (!show) return null;

  const psychologyResources = [
    {
      title: "Stress Management",
      description: "Learn effective techniques for managing stress and anxiety in daily life.",
      color: "#4CAF50",
      icons: [
        { icon: "nc-icon nc-sound-wave", position: "center" },
        { icon: "nc-icon nc-bulb-63", position: "top-left" },
        { icon: "nc-icon nc-satisfied", position: "top-right" },
        { icon: "nc-icon nc-umbrella-13", position: "bottom-left" },
        { icon: "nc-icon nc-air-baloon", position: "bottom-right" }
      ]
    },
    {
      title: "Mindfulness Practice",
      description: "Discover mindfulness techniques to stay present and improve mental well-being.",
      color: "#2196F3",
      icons: [
        { icon: "nc-icon nc-planet", position: "center" },
        { icon: "nc-icon nc-sun-fog-29", position: "top-left" },
        { icon: "nc-icon nc-cloud-upload-94", position: "top-right" },
        { icon: "nc-icon nc-compass-05", position: "bottom-left" },
        { icon: "nc-icon nc-air-baloon", position: "bottom-right" }
      ]
    },
    {
      title: "Emotional Intelligence",
      description: "Enhance your ability to understand and manage emotions effectively.",
      color: "#FF5722",
      icons: [
        { icon: "nc-icon nc-heart-2", position: "center" },
        { icon: "nc-icon nc-satisfied", position: "top-left" },
        { icon: "nc-icon nc-chat-33", position: "top-right" },
        { icon: "nc-icon nc-favourite-28", position: "bottom-left" },
        { icon: "nc-icon nc-send", position: "bottom-right" }
      ]
    },
    {
      title: "Positive Psychology",
      description: "Focus on strengths and positive experiences to build resilience and happiness.",
      color: "#9C27B0",
      icons: [
        { icon: "nc-icon nc-sun-fog-29", position: "center" },
        { icon: "nc-icon nc-favourite-28", position: "top-left" },
        { icon: "nc-icon nc-satisfied", position: "top-right" },
        { icon: "nc-icon nc-bulb-63", position: "bottom-left" },
        { icon: "nc-icon nc-planet", position: "bottom-right" }
      ]
    },
    {
      title: "Sleep Hygiene",
      description: "Improve your sleep quality with evidence-based practices and routines.",
      color: "#3F51B5",
      icons: [
        { icon: "nc-icon nc-moon-fog", position: "center" },
        { icon: "nc-icon nc-cloud-upload-94", position: "top-left" },
        { icon: "nc-icon nc-watch-time", position: "top-right" },
        { icon: "nc-icon nc-umbrella-13", position: "bottom-left" },
        { icon: "nc-icon nc-sound-wave", position: "bottom-right" }
      ]
    },
    {
      title: "Relationship Building",
      description: "Learn skills to build and maintain healthy relationships in all areas of life.",
      color: "#E91E63",
      icons: [
        { icon: "nc-icon nc-chat-33", position: "center" },
        { icon: "nc-icon nc-favourite-28", position: "top-left" },
        { icon: "nc-icon nc-satisfied", position: "top-right" },
        { icon: "nc-icon nc-send", position: "bottom-left" },
        { icon: "nc-icon nc-heart-2", position: "bottom-right" }
      ]
    }
  ];

  return (
    <div style={modalOverlayStyle} onClick={onHide}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">Psychology Resources</h4>
          <button 
            type="button" 
            className="close" 
            onClick={onHide}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <Container fluid>
            <Row className="g-4">
              {psychologyResources.map((resource, index) => (
                <Col key={index} xs={12} md={6} lg={4}>
                  <Card className="psychology-card h-100">
                    <div className="psychology-icon-container" style={{ backgroundColor: resource.color }}>
                      {resource.icons.map((iconData, iconIndex) => (
                        <i 
                          key={iconIndex}
                          className={`${iconData.icon} psychology-icon ${iconData.position}`}
                        ></i>
                      ))}
                    </div>
                    <Card.Body>
                      <Card.Title>{resource.title}</Card.Title>
                      <Card.Text>{resource.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Psychology; 