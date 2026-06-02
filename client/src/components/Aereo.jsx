import { React, useState, useEffect, useContext } from 'react';
import { Col, Row, Button, Container, ListGroup, Badge, Form } from 'react-bootstrap';
import { BsFillSquareFill } from 'react-icons/bs';
import { UserContext, MessageContext, DirtyContext } from '../Context';
import { FormManuale, FormAutomatica } from './FormPrenotazioni';

const SeatMap = (props) => {

  const aereo = props.aereo;
  const userobj = useContext(UserContext);
  const user = userobj.user;
  const loggedIn = userobj.loggedIn;
  const [clickPosti, setClickPosti] = useState(false);
  const [postiRichiesti, setPostiRichiesti] = useState([]);
  const [mod, setMod] = useState("");
  const [showBtn, setShowBtn] = useState(true);

  let numeroPostiLiberi = 0;
  let postiOccupati = 0;
  let postiToT = 0;

  const [postiPresi, setPostiPresi] = useState([]);
  const [postiPresiCounter, setPostiPresiCounter] = useState(0);

  function numeroPostiDisponibili() {
    const postiNonOccupati = aereo.posti.filter((posto) => posto.idPrenotazione === null);
    return postiNonOccupati.length;
  }

  function aggiungiPostiPresi(posti) {
    setPostiPresi(posti);
    setPostiPresiCounter(prevCounter => prevCounter + 1);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPostiPresi([]);
      setPostiPresiCounter(0);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [postiPresiCounter]);

  function randomPostiRichiesti(n) {
    if (n<=numeroPostiLiberi) {
      setPostiRichiesti(aereo.posti
        .filter((posto) => posto.idPrenotazione === null)
        .slice(0, n)
        .map((posto) => ({ seat: posto.posizioneFila, row: posto.numeroFila })))
    }else{
      setPostiRichiesti([])
    }
  }

  if (aereo && aereo.posti && Array.isArray(aereo.posti)) {
    numeroPostiLiberi = aereo.posti.filter((posto) => posto.idPrenotazione === null).length;
    postiOccupati = aereo.posti.length - numeroPostiLiberi;
    postiToT = aereo.posti.length;
  }

  function onSeatClick(row, seat) {
    const posto = { seat: seat, row: row };

    setPostiRichiesti((prevPostiRichiesti) => {
      // Verifica se il posto è già presente all'interno di postiRichiesti
      const postoPresente = prevPostiRichiesti.some(
        (p) => p.seat === seat && p.row === row
      );

      if (postoPresente) {
        // Se il posto è già presente, rimuovilo dall'array
        return prevPostiRichiesti.filter(
          (p) => !(p.seat === seat && p.row === row)
        );
      } else {
        // Se il posto non è presente, aggiungilo all'array
        return [...prevPostiRichiesti, posto];
      }
    });
  }


  const renderSeat = (row, seat) => {
    const isOccupied = aereo.posti.filter((e) => e.posizioneFila === seat && e.numeroFila === row)[0].idPrenotazione !== null ? true : false;
    const isRichiesto = postiRichiesti.some((e) => e.row === row && e.seat === seat);
    const isPreso = postiPresi.some((e) => e.row === row && e.seat === seat);
    const seatColor = isPreso ? '#0d6efd' : isRichiesto ? "#ffc11d" : isOccupied ? 'red' : 'green';

    return (
      <Button style={{ backgroundColor: seatColor, margin: '2px' }}
        key={`${row}${seat}`}
        variant="success"
        className="seat-button"
        disabled={!clickPosti || isOccupied}
        onClick={() => onSeatClick(row, seat)}
      >
        {seat}
      </Button>
    );
  };

  const renderRow = (row) => {
    const seats = [];

    for (let seat = 0; seat < aereo.postiPerFila; seat++) {
      seats.push(renderSeat(row, String.fromCharCode(97 + seat)));
    }

    return (
      <Row key={row} className="rigaAereo" style={{ marginBottom: '10px' }}>
        <Col sm={12} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '20px', width: '0px', textAlign: 'right' }}>{row}</div>
          <div>{seats}</div>
        </Col>
      </Row>
    );
  };

  const renderSeatMap = () => {
    const seatMap = [];

    for (let row = 1; row <= aereo.numFile; row++) {
      seatMap.push(renderRow(row));
    }

    return seatMap;
  };

  return (
    <Row>
      <Col className="colonnaPosti" xs={12} md={8}>
        <Container className="cp" style={{ display: 'flex', borderColor: 'grey', flexDirection: 'column', alignItems: 'center' }}>
          {renderSeatMap()}
        </Container>
      </Col>
      <Col xs={12} md={4}>
        <InfoAereo setClickPosti={setClickPosti} showBtn={showBtn} setShowBtn={setShowBtn} setMod={setMod} mod={mod} loggedIn={loggedIn} user={user} numeroPostiLiberi={numeroPostiLiberi} postiOccupati={postiOccupati} postiToT={postiToT} postiRichiesti={postiRichiesti}></InfoAereo>
        {mod === "manuale" && user && loggedIn ? <FormManuale aereo={aereo} setClickPosti={setClickPosti} setPostiRichiesti={setPostiRichiesti} setMod={setMod} setShowBtn={setShowBtn} postiRichiesti={postiRichiesti} aggiungiPostiPresi={aggiungiPostiPresi} modificaStatoRisposta={props.modificaStatoRisposta}></FormManuale> : null}
        {mod === "automatica" && user && loggedIn ? <FormAutomatica aereo={aereo} setMod={setMod} setShowBtn={setShowBtn} aggiungiPostiPresi={aggiungiPostiPresi} modificaStatoRisposta={props.modificaStatoRisposta} setPostiRichiesti={setPostiRichiesti} postiRichiesti={postiRichiesti} randomPostiRichiesti={randomPostiRichiesti} numeroPostiDisponibili={numeroPostiDisponibili}></FormAutomatica> : null}
      </Col>
    </Row>
  );

}


function InfoAereo(props) {
  
  function handleAutomatica() {
    props.setMod("automatica")
    props.setShowBtn(false)
  }

  function handleManuale() {
    props.setClickPosti(true)
    props.setMod("manuale")
    props.setShowBtn(false)
  }

  return (
    <ListGroup as="ol" className='colDestra'>
      <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">Libero <BsFillSquareFill color='green' /></ListGroup.Item>
      <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">Prenotato <BsFillSquareFill color='red' /></ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Numero posti disponibili</div>
        </div>
        <Badge bg="success" pill>
          {props.numeroPostiLiberi}
        </Badge>
      </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Numero posti occupati</div>
        </div>
        <Badge bg="danger" pill>
          {props.postiOccupati}
        </Badge>
      </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Numero posti totali</div>
        </div>
        <Badge bg="primary" pill>
          {props.postiToT}
        </Badge>
      </ListGroup.Item>
      {props.mod === "manuale" ?
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Numero posti richiesti</div>
          </div>
          <Badge bg="warning" pill>
            {props.postiRichiesti.length}
          </Badge>
        </ListGroup.Item> : null}
      {props.user && props.loggedIn && props.showBtn ? <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
        <Container fluid>
          <Row>
            <Col><Button variant='success' onClick={() => handleAutomatica()} className='btn w-100'>Prenotazione <br />automatica</Button></Col>
            <Col><Button variant='primary' onClick={() => handleManuale()} className='btn w-100'>Prenotazione <br /> manuale</Button></Col>
          </Row>
        </Container>
      </ListGroup.Item> : null}
    </ListGroup>
  );
}

export default SeatMap;
