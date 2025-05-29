import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import './DietPlans.css';

// Custom Modal Styles
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

const DietPlans = ({ show, onHide }) => {
  if (!show) return null;

  const dietPlans = [
    {
      title: "Mediterranean Diet",
      description: "Rich in fruits, vegetables, whole grains, olive oil, and lean proteins. Known for heart health benefits.",
      color: "#4CAF50",
      icons: [
        { icon: "nc-icon nc-apple", position: "center" },
        { icon: "nc-icon nc-basket", position: "top-left" },
        { icon: "nc-icon nc-sun-fog-29", position: "top-right" },
        { icon: "nc-icon nc-leaf", position: "bottom-left" },
        { icon: "nc-icon nc-fish", position: "bottom-right" }
      ]
    },
    {
      title: "Keto Diet",
      description: "High-fat, low-carb diet that aims to put your body in a state of ketosis for weight loss.",
      color: "#FF5722",
      icons: [
        { icon: "nc-icon nc-cart-simple", position: "center" },
        { icon: "nc-icon nc-egg-2", position: "top-left" },
        { icon: "nc-icon nc-cheese", position: "top-right" },
        { icon: "nc-icon nc-meat", position: "bottom-left" },
        { icon: "nc-icon nc-nuts", position: "bottom-right" }
      ]
    },
    {
      title: "Vegetarian Diet",
      description: "Plant-based diet excluding meat, rich in vegetables, fruits, grains, and plant proteins.",
      color: "#8BC34A",
      icons: [
        { icon: "nc-icon nc-tree", position: "center" },
        { icon: "nc-icon nc-apple", position: "top-left" },
        { icon: "nc-icon nc-flower-05", position: "top-right" },
        { icon: "nc-icon nc-leaf", position: "bottom-left" },
        { icon: "nc-icon nc-sun-fog-29", position: "bottom-right" }
      ]
    },
    {
      title: "Paleo Diet",
      description: "Based on foods presumed eaten during the Paleolithic era, focusing on whole foods.",
      color: "#795548",
      icons: [
        { icon: "nc-icon nc-planet", position: "center" },
        { icon: "nc-icon nc-meat", position: "top-left" },
        { icon: "nc-icon nc-fish", position: "top-right" },
        { icon: "nc-icon nc-nuts", position: "bottom-left" },
        { icon: "nc-icon nc-apple", position: "bottom-right" }
      ]
    },
    {
      title: "Balanced Diet",
      description: "Includes all food groups in proper proportions for optimal nutrition and health.",
      color: "#2196F3",
      icons: [
        { icon: "nc-icon nc-satisfied", position: "center" },
        { icon: "nc-icon nc-apple", position: "top-left" },
        { icon: "nc-icon nc-meat", position: "top-right" },
        { icon: "nc-icon nc-bread", position: "bottom-left" },
        { icon: "nc-icon nc-milk-bottle", position: "bottom-right" }
      ]
    },
    {
      title: "Vegan Diet",
      description: "Excludes all animal products, focusing on plant-based foods and alternatives.",
      color: "#4CAF50",
      icons: [
        { icon: "nc-icon nc-leaf", position: "center" },
        { icon: "nc-icon nc-tree", position: "top-left" },
        { icon: "nc-icon nc-flower-05", position: "top-right" },
        { icon: "nc-icon nc-apple", position: "bottom-left" },
        { icon: "nc-icon nc-basket", position: "bottom-right" }
      ]
    }
  ];

  return (
    <div style={modalOverlayStyle} onClick={onHide}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">Healthy Diet Plans</h4>
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
              {dietPlans.map((plan, index) => (
                <Col key={index} xs={12} md={6} lg={4}>
                  <Card className="diet-plan-card h-100">
                    <div className="diet-plan-icon-container" style={{ backgroundColor: plan.color }}>
                      {plan.icons.map((iconData, iconIndex) => (
                        <i 
                          key={iconIndex}
                          className={`${iconData.icon} diet-plan-icon ${iconData.position}`}
                        ></i>
                      ))}
                    </div>
                    <Card.Body>
                      <Card.Title>{plan.title}</Card.Title>
                      <Card.Text>{plan.description}</Card.Text>
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

export default DietPlans; 