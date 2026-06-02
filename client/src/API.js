import dayjs from "dayjs";

const URL = 'http://localhost:3001/api/';




/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

async function getAllAerei() {
    const response = await fetch(URL+'aerei');
    const aerei = await response.json();
    if (response.ok) {
      return aerei.map((e) => ({idAereo: e.idAereo, nome: e.tipoAereo, modello:e.modelloAereo}) )
    } else {
      throw aerei;  
    }
  }

  async function getDatiByAereoId(id) {
    try {
      const response = await fetch(`${URL}aerei/${id}`);
      const aereo = await response.json();

      if (response.ok) {
        const datiAereo = {
          aereoId: aereo.aereoId,
          nomeAereo: aereo.tipoAereo,
          numFile: aereo.numFile,
          postiPerFila: aereo.postiPerFila,
          modello:aereo.modello,
          posti: aereo.posti.map((e) => ({
            id: e.postoId,
            numeroFila: e.numFila,
            posizioneFila: e.posFila,
            idPrenotazione: e.idPrenotazione
          }))
        };
  
        return datiAereo;
      } else {
        throw aereo; 
      }
    } catch (error) {
      throw error;
    }
  }

//ottieni le prenotazioni di un utente loggato
const getPrenotazioni = async () => {
  const response = await fetch(URL + 'prenotazioni', { credentials: 'include' });
  const prenotazioni = await response.json();
  
  if (response.ok) {
    return prenotazioni.map((e) => ({
      idPrenotazione: e.idPrenotazione,
      nomeAereo: e.tipoAereo,
      modello: e.modelloAereo,
      dataPrenotazione: dayjs(e.dataPrenotazione).toDate(), // Converti la data in oggetto JavaScript Date
      posti: e.posti.map((posto) => ({
        numeroFila: posto.numeroFila,
        posizioneFila: posto.posizioneFila,
        idPosto: posto.idPosto
      }))
    }));
  } else {
    throw prenotazioni;
  }
}

//elimina una prenotazione 
function deletePrenotazione(id) {
  // call  DELETE /api/prenotazione/<id>
  return new Promise((resolve, reject) => {
    fetch(URL+`prenotazioni/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


function addPrenotazione(prenotazione) {
  // call  POST /api/prenotazione
  return new Promise((resolve, reject) => {
    fetch(URL + `prenotazioni`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, prenotazione)),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((id) => resolve(id)).catch(() => {
            reject({ error: "Cannot parse server response." });
          });
        } else {
          response.json().then((message) => {
              reject(message);
          }).catch(() => {
            reject({ error: "Cannot parse server response." });
          });
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      });
  });
}


/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

const API = {logIn, getUserInfo, logOut, getAllAerei, getDatiByAereoId, getPrenotazioni, deletePrenotazione, addPrenotazione};
export default API;