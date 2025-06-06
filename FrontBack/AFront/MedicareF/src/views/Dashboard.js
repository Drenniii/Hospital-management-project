import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import ApiService from "../service/ApiService";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

function Dashboard() {
  const [tasks, setTasks] = React.useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");



React.useEffect(() => {
  fetchTasks();
}, []);

const fetchTasks = () => {
  ApiService.getAllTasks()
    .then((res) => {
      console.log("Fetched tasks:", res.data);
      setTasks(res);
    })
    .catch((err) => {
      console.error("Error fetching tasks:", err);
    });
};
const handleEdit = (task) => {
  setEditingTaskId(task.id);
  setEditedDescription(task.description);
};
const handleSaveEdit = (taskId) => {
  ApiService.updateTask(taskId, {
    description: editedDescription,
    completed: tasks.find(t => t.id === taskId).completed,
  })
    .then(() => {
      setEditingTaskId(null);
      setEditedDescription("");
      fetchTasks();
    })
    .catch(err => console.error("Edit failed:", err));
};


const handleDelete = (id) => {
  ApiService.deleteTask(id)
    .then(() => fetchTasks())
    .catch((err) => console.error("Error deleting task:", err));
};

const toggleTaskCompleted = (task) => {
  const updatedTask = { ...task, completed: !task.completed };
  ApiService.updateTask(task.id, updatedTask)
    .then(() => fetchTasks())
    .catch((err) => console.error("Error updating task status:", err));
};

const handleCreateTask = () => {
  if (!newTaskDescription.trim()) {
    console.log("Task description is empty");
    return;
  }

 
  const newTask = {
    description: newTaskDescription,
    completed: false,
  };

  console.log("Sending task:", newTask);

  ApiService.createTask(newTask)
    .then(() => {
      console.log("Task created!");
      setNewTaskDescription("");
      fetchTasks(); // refresh
    })
    .catch((err) => console.error("Create task error:", err));
};


  return (
    <>
      <Container fluid>
        <Row>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Number</p>
                      <Card.Title as="h4">150GB</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update Now
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-light-3 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Revenue</p>
                      <Card.Title as="h4">$ 1,345</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  Last day
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Errors</p>
                      <Card.Title as="h4">23</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock-o mr-1"></i>
                  In the last hour
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-favourite-28 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Followers</p>
                      <Card.Title as="h4">+45K</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Users Behavior</Card.Title>
                <p className="card-category">24 Hours performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: [
                        "9:00AM",
                        "12:00AM",
                        "3:00PM",
                        "6:00PM",
                        "9:00PM",
                        "12:00PM",
                        "3:00AM",
                        "6:00AM",
                      ],
                      series: [
                        [287, 385, 490, 492, 554, 586, 698, 695],
                        [67, 152, 143, 240, 287, 335, 435, 437],
                        [23, 113, 67, 108, 190, 239, 307, 308],
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: 800,
                      showArea: false,
                      height: "245px",
                      axisX: {
                        showGrid: false,
                      },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: {
                        right: 50,
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Open <i className="fas fa-circle text-danger"></i>
                  Click <i className="fas fa-circle text-warning"></i>
                  Click Second Time
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Email Statistics</Card.Title>
                <p className="card-category">Last Campaign Performance</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      labels: ["40%", "20%", "40%"],
                      series: [40, 20, 40],
                    }}
                    type="Pie"
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Open <i className="fas fa-circle text-danger"></i>
                  Bounce <i className="fas fa-circle text-warning"></i>
                  Unsubscribe
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock"></i>
                  Campaign sent 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">2024 Sales</Card.Title>
                <p className="card-category">Medicare+</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      series: [
                        [
                          542,
                          443,
                          320,
                          780,
                          553,
                          453,
                          326,
                          434,
                          568,
                          610,
                          756,
                          895,
                        ],
                        [
                          412,
                          243,
                          280,
                          580,
                          453,
                          353,
                          300,
                          364,
                          368,
                          410,
                          636,
                          695,
                        ],
                      ],
                    }}
                    type="Bar"
                    options={{
                      seriesBarDistance: 10,
                      axisX: {
                        showGrid: false,
                      },
                      height: "245px",
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          seriesBarDistance: 5,
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Terapist <i className="fas fa-circle text-danger"></i>
                  Nutricist
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-check"></i>
                  Data information certified
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Tasks</Card.Title>
                <p className="card-category">Backend development</p>
              </Card.Header>
              <Card.Body>
                <div className="d-flex mb-3">
  <Form.Control
    type="text"
    placeholder="Enter new task"
    value={newTaskDescription}
    onChange={(e) => setNewTaskDescription(e.target.value)}
  />
  <Button
    variant="success"
    className="ml-2"
    onClick={handleCreateTask}
  >
    Add
  </Button>
</div>
                <div className="table-full-width">
                  <Table>
                  <tbody>
  {tasks.map((task) => (
    <tr key={task.id}>
      <td>
        <Form.Check className="mb-1 pl-0">
          <Form.Check.Label>
            <Form.Check.Input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompleted(task)}
            />
            <span className="form-check-sign"></span>
          </Form.Check.Label>
        </Form.Check>
      </td>

      <td>
        {editingTaskId === task.id ? (
          <Form.Control
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        ) : (
          task.description
        )}
      </td>

      <td className="td-actions text-right">
        <OverlayTrigger
          overlay={
            <Tooltip id={`edit-${task.id}`}>
              {editingTaskId === task.id ? "Save" : "Edit Task"}
            </Tooltip>
          }
        >
          <Button
            className="btn-simple btn-link p-1 mr-2"
            type="button"
            variant="info"
            onClick={() => {
              if (editingTaskId === task.id) {
                ApiService.updateTask(task.id, {
                  ...task,
                  description: editedDescription,
                })
                  .then(() => {
                    setEditingTaskId(null);
                    setEditedDescription("");
                    fetchTasks();
                  })
                  .catch((err) =>
                    console.error("Error updating task description:", err)
                  );
              } else {
                setEditingTaskId(task.id);
                setEditedDescription(task.description);
              }
            }}
          >
            <i className={`fas ${editingTaskId === task.id ? "fa-check" : "fa-edit"}`}></i>
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          overlay={<Tooltip id={`delete-${task.id}`}>Remove</Tooltip>}
        >
          <Button
            className="btn-simple btn-link p-1"
            type="button"
            variant="danger"
            onClick={() => handleDelete(task.id)}
          >
            <i className="fas fa-times"></i>
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  ))}
</tbody>

                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
