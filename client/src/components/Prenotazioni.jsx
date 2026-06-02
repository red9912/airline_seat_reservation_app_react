import { React, useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Spinner, Container, Nav, Accordion, Card } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { IoIosArrowDown } from 'react-icons/io';
import API from '../API';
import dayjs from 'dayjs';
import { UserContext, MessageContext, DirtyContext } from '../Context';

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

function Prenotazioni(props) {
    const [loadingPrenotazioni, setLoadingPrenotazioni] = useState(true);
    const [prenotazioni, setPrenotazioni] = useState([]);
    const dirtyobj = useContext(DirtyContext);
    const dirty = dirtyobj.dirty;
    const triggerDirty = dirtyobj.triggerDirty;
    const { handleErrors } = useContext(MessageContext);


    const deletePrenotazione = (idPrenotazione) => {
        API.deletePrenotazione(idPrenotazione)
            .then(() => { triggerDirty(true); handleErrors({error:"prenotazione eliminata con successo"}); props.modificaStatoRisposta("positivo") })
            .catch(e => handleErrors(e));
    }

    useEffect(() => {
        try {
            setLoadingPrenotazioni(true);
            API.getPrenotazioni().then((a) => setPrenotazioni(a))
                .catch((err) => console.log(err));
            setLoadingPrenotazioni(false);
        } catch (err) {
            setLoadingPrenotazioni(false);
        }

    }, [dirty]); 


    function handleDeleteButton(prenotazioneId) {
        deletePrenotazione(prenotazioneId);
    }

    return (
        <>
            <h4>Prenotazioni effettuate</h4>
            {!loadingPrenotazioni ?
                prenotazioni.length ? (<Accordion>{
                    prenotazioni.map((pren) => (
                        <Card key={pren.idPrenotazione}>
                            <Card.Header>
                                <Row className="w-100" key={pren.idPrenotazione}>
                                    <Col md="auto"><CustomToggle eventKey={pren.idPrenotazione}><IoIosArrowDown /></CustomToggle></Col>
                                    <Col>{pren.nomeAereo + ": " + pren.modello}</Col>
                                    <Col>{dayjs(pren.dataPrenotazione).format('DD/MM/YYYY')}</Col>
                                    <Col>numero posti prenotati: {pren.posti.length}</Col>
                                    <Button className='bottonePren' variant='danger' onClick={() => handleDeleteButton(pren.idPrenotazione)}>-</Button>
                                </Row>
                            </Card.Header>
                            <Accordion.Collapse eventKey={pren.idPrenotazione}>
                                <Card.Body className='custom-body'>
                                    {pren.posti.map((posti) => (
                                        <Row key={posti.idPosto} className="w-100">
                                            <Col>numero fila: {posti.numeroFila}</Col>
                                            <Col>posizione fila: {posti.posizioneFila}</Col>
                                        </Row>
                                    ))}
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    ))}
                </Accordion>) : <p className='par_pren'>nessuna prenotazione</p> : <Loading className="loadPren"></Loading>
            }
        </>
    );
}

function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey);

    return (
        <button
            type="button"
            style={{ backgroundColor: 'transparent', border: 0 }}
            onClick={decoratedOnClick}
        >
            {children}
        </button>
    );
}


export default Prenotazioni;