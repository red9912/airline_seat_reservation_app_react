import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton, LoginButton } from './Auth';
import { FaPlaneDeparture } from 'react-icons/fa';

function Navigation(props) {
    return (
        <Navbar bg="success" expand="sm" variant="dark" fixed="top" className="navbar-padding">
            <Link to="/">
                <Navbar.Brand>
                    <FaPlaneDeparture /> Posti Aereo
                </Navbar.Brand>
            </Link>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text className="mx-2">
                    {props.user && props.user.name && `Welcome, ${props.user.name}!`}
                </Navbar.Text>
                <Form className="mx-2">
                    {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                </Form>
            </Navbar.Collapse>

        </Navbar>
    );
}

export default Navigation;