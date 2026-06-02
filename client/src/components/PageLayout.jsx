import { React, useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Spinner, Container, Nav } from 'react-bootstrap';
import MainRoute from './MainRoute';

function Loading(props) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spinner className='m-2' animation="border" variant='success' role="status" />
      </div>
    )
  }

function PageLayout(props) {
    const aerei=props.aerei;
    const loading=props.loading;
    return (
      <>
        {!props.loading ? <MainRoute aerei={aerei} loading={loading}/> : <Loading/>}
      </>
    );
  }

export default PageLayout;