import API from '../API';
import { React, useState, useEffect, useContext } from 'react';
import { Col, Row, Button, Container, ListGroup, Badge, Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import { UserContext, MessageContext, DirtyContext } from '../Context';

function FormAutomatica(props) {
    const dirtyobj = useContext(DirtyContext);
    const triggerDirty = dirtyobj.triggerDirty;
    const { handleErrors } = useContext(MessageContext);
    const [numeroPosti, setNumeroPosti] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const aereo = props.aereo;

    function handleSubmit() {
        event.preventDefault();
        if (isNaN(parseInt(numeroPosti))) {
            setErrorMsg('valore non valido');
        } else if (parseInt(numeroPosti) < 0) {
            setErrorMsg('valore negativo non valido');
        } else if (numeroPosti > props.numeroPostiDisponibili()) {
            setErrorMsg('non ci sono abbastanza posti disponibili per la prenotazione');
        }
        else {
            props.setMod("")
            props.setShowBtn(true)

            const prenotazione = { posti: props.postiRichiesti, idAereo: aereo.aereoId, numeroPosti: numeroPosti }
            props.setPostiRichiesti([])
            API.addPrenotazione(prenotazione)
                .then(() => { triggerDirty(true), handleErrors({ error: "operazione avvenuta con successo" }); props.modificaStatoRisposta("positivo") })
                .catch(e => {
                    props.modificaStatoRisposta("negativo")
                    if (Array.isArray(e.postiPrenotati)) {
                        props.aggiungiPostiPresi(e.postiPrenotati)
                        handleErrors(e)
                    } else {
                        handleErrors(e);
                    }
                    triggerDirty(true)
                });

        }
    }

    function handleCancel() {
        props.setMod("")
        props.setShowBtn(true)
        props.setPostiRichiesti([])
    }

    function handleNumeroPostiChange(event) {
        const value = event.target.value;
      
        if (value.length === 1 && value !== "0") {
          setNumeroPosti(parseInt(value));
          props.randomPostiRichiesti(parseInt(value));
        } else if (value.length > 1 && value[0] !== "0" && value[0] !== "-") {
          setNumeroPosti(parseInt(value));
          props.randomPostiRichiesti(parseInt(value));
        } else {
          setNumeroPosti('');
          props.randomPostiRichiesti(0);
        }
      }


    return (
        <Container fluid className='formManuale'>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                    <Form.Label>Inserire il numero di posti che si vuole prenotare</Form.Label>
                    <Form.Control type="number" name="numeroPosti" min={1} step={1} value={numeroPosti} onChange={handleNumeroPostiChange} />
                </Form.Group>

                <Button className="mb-3" variant="success" type="submit">Prenota</Button>
                &nbsp;
                <Button className='mb-3' variant='danger' onClick={() => handleCancel()}>Cancella</Button>
            </Form>
        </Container>
    );
}


function FormManuale(props) {
    const dirtyobj = useContext(DirtyContext);
    const triggerDirty = dirtyobj.triggerDirty;
    const { handleErrors } = useContext(MessageContext);
    const [errorMsg, setErrorMsg] = useState('');
    const aereo = props.aereo;

    function handleSubmit() {
        event.preventDefault();
        if (props.postiRichiesti.length === 0) {
            setErrorMsg("nessun posto richiesto")
        } else {
            const prenotazione = { posti: props.postiRichiesti, idAereo: aereo.aereoId, numeroPosti: props.postiRichiesti.length }
            props.setClickPosti(false)
            props.setPostiRichiesti([])
            props.setMod("")
            props.setShowBtn(true)
            API.addPrenotazione(prenotazione)
                .then(() => { triggerDirty(true), handleErrors({ error: "operazione avvenuta con successo" }); props.modificaStatoRisposta("positivo") })
                .catch(e => {
                    props.modificaStatoRisposta("negativo")
                    if (Array.isArray(e.postiPrenotati)) {
                        props.aggiungiPostiPresi(e.postiPrenotati)
                        handleErrors(e)
                    } else {
                        handleErrors(e);
                    }
                    triggerDirty(true)
                });
        }
    }

    function handleCancel() {
        props.setClickPosti(false)
        props.setPostiRichiesti([])
        props.setMod("")
        props.setShowBtn(true)
    }

    return (
        <Container fluid className='formManuale'>
            {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                    <Form.Label>Selezionare i posti verdi nella schermata a sinistra</Form.Label>
                </Form.Group>
                <Button className="mb-3" variant="success" type="submit">Prenota</Button>
                &nbsp;
                <Button className='mb-3' variant='danger' onClick={() => handleCancel()}>Cancella</Button>
            </Form>
        </Container>
    );
}

export { FormAutomatica, FormManuale };