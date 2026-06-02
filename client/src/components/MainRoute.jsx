import { Row, Col, Button, Spinner, Container, Nav, Toast } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { React, useState, useEffect, useContext } from 'react';
import Aereo from './Aereo';
import API from '../API';
import { UserContext, MessageContext, DirtyContext } from '../Context';
import Prenotazioni from './Prenotazioni'

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

function MainRoute(props) {

  const dirtyobj = useContext(DirtyContext);
  const dirty = dirtyobj.dirty;
  const triggerDirty = dirtyobj.triggerDirty;
  const userobj = useContext(UserContext);
  const user = userobj.user;
  const loggedIn = userobj.loggedIn;
  const mess = useContext(MessageContext);
  const message = mess.message;
  const setMessage = mess.setMessage;

  const [activeTab, setActiveTab] = useState(1);
  const [loadingAereo, setLoadingAereo] = useState(true);
  const [statoRisposta, setStatoRisposta] = useState("positivo");
  // This state contains the list of films (it is initialized from a predefined array).
  const [aereo, setAereo] = useState({});

  useEffect(() => {
    if (dirty) {
      try {
        setLoadingAereo(true);
        API.getDatiByAereoId(activeTab).then((a) => setAereo(a))
          .catch((err) => console.log(err));
        setLoadingAereo(false);
        triggerDirty(false);
      } catch (err) {
        setLoadingAereo(false);
        triggerDirty(false);
      }
    }
  }, [activeTab, dirty]);

  function modificaStatoRisposta(stato){
    setStatoRisposta(stato);
  }


  const aerei = props.aerei;

  const handleTabSelect = (tab) => {
    triggerDirty(true)
    setActiveTab(tab);
  };

  return (
    <Container fluid className='below-nav' style={{ backgroundColor: '#333', color: '#fff' }}>
      {user && loggedIn ? <Prenotazioni modificaStatoRisposta={modificaStatoRisposta}></Prenotazioni> : null}
      <h4>Aerei</h4>
      <Tabs activeKey={activeTab} onSelect={handleTabSelect} justify className="d-flex">

        {aerei.map((aer) => (
          <Tab key={aer.idAereo} eventKey={aer.idAereo} title={aer.nome}>
          {!loadingAereo ? (
            <>
              <h5 className='modello'>{aereo.modello}</h5>
              <div style={{ position: 'relative' }}>
                <Toast
                  show={message !== ''}
                  onClose={() => setMessage('')}
                  delay={5000}
                  autohide
                  bg={statoRisposta === 'positivo' ? 'success' : 'danger'}
                  style={{ position: 'absolute', top: 0, left: 0, zIndex: 9999 }}
                >
                  <Toast.Body>{message}</Toast.Body>
                </Toast>
                <Aereo aereo={aereo} modificaStatoRisposta={modificaStatoRisposta} />
              </div>
            </>
          ) : (
            <Loading></Loading>
          )}
        </Tab>
        ))}

      </Tabs>

    </Container>
  );
}

export default MainRoute;