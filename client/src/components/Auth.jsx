import { useState } from 'react';
import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState('enrico@test.com');
  const [password, setPassword] = useState('pwd');

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    props.login(credentials)
      .then( () => navigate( "/" ) )
      .catch((err) => { 
        setErrorMessage(err.error); 
        setShow(true); 
      });
  };

  return (
    <Row className="justify-content-md-center loginForm h-100">
    <Col md={4} >
    <h1 className="pb-3">Login</h1>

      <Form  onSubmit={handleSubmit}>
          <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errorMessage}
          </Alert>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>email</Form.Label>
            <Form.Control
              type="email"
              value={username} placeholder="Example: john.doe@polito.it"
              onChange={(ev) => setUsername(ev.target.value)}
              required={true}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password} placeholder="Enter the password."
              onChange={(ev) => setPassword(ev.target.value)}
              required={true} minLength={3}
            />
          </Form.Group>
          <Button className="mt-3" variant="success" type="submit">Login</Button>
          <Button className="mt-3 btnCanc" variant="danger" onClick={()=>{props.onCancel();navigate('/')}}>Cancella</Button>
      </Form>
      </Col>
      </Row>

  )
};

function LogoutButton(props) {
  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

function LoginButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
  )
}

function LoginLayout(props) {
    return (
      <Container fluid style={{backgroundColor: '#333', color: '#fff', minHeight: '100vh'}}>
      <Row>
        <Col>
          <LoginForm login={props.login} onCancel={props.onCancel}/>
        </Col>
      </Row>
      </Container>
    );
  }

export { LoginForm, LogoutButton, LoginButton, LoginLayout };