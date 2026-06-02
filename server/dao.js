'use strict';

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('db_aerei.db', (err) => {
  if (err) throw err;
});


// get the aereo identified by {id}
exports.getAereo = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT aerei.id,aerei.nome,aerei.modello FROM aerei WHERE aerei.id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Aereo not found.' });
      } else {
        const aereo = { id: row.id, nome: row.nome, modello:row.modello};
        resolve(aereo);
      }
    });
  });
};

// ottieni tutti i dati di un aereo
exports.listPostiByAereo = (aereoId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT aerei.id as aereoId, aerei.nome as nomeAereo, aerei.numeroFile as numFile, aerei.postiPerFila, posti.id AS postoId, posti.numeroFila as numFila, posti.posizioneFila as posFila, posti.idPrenotazione, aerei.modello FROM posti INNER JOIN aerei ON aerei.id = posti.aereoId WHERE aerei.id = ?';

    db.all(sql, [aereoId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const aereo = {
        aereoId: rows[0].aereoId,
        tipoAereo: rows[0].nomeAereo,
        numFile: rows[0].numFile,
        postiPerFila: rows[0].postiPerFila,
        modello:rows[0].modello,
        posti: rows.map((e) => ({
          postoId: e.postoId,
          numFila: e.numFila,
          posFila: e.posFila,
          idPrenotazione: e.idPrenotazione
        }))
      };

      resolve(aereo);
    });
  });
};

// get all aerei
exports.datiAerei = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT aerei.id as idAereo, aerei.nome, aerei.modello as nomeAereo FROM aerei';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const aerei = rows.map((e) => ({ idAereo: e.idAereo, tipoAereo: e.nome, modelloAereo:e.modello }));
      resolve(aerei);
    });
  });
};

//restituisce le prenotazioni di un utente loggato
exports.listaPrenotazioni = (user) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT prenotazioni.id as idPrenotazione, aerei.modello, aerei.nome as nomeAereo, prenotazioni.dataPrenotazione, posti.numeroFila, posti.posizioneFila, posti.id as idPosto FROM aerei, prenotazioni, posti WHERE aerei.id=prenotazioni.aereoId AND posti.idPrenotazione=prenotazioni.id AND prenotazioni.utenteId=?';
    db.all(sql, [user], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      let prenotazioniArray = [];

      rows.forEach(row => {
        let existingPrenotazione = prenotazioniArray.find(prenotazione => prenotazione.idPrenotazione === row.idPrenotazione);

        if (existingPrenotazione) {
          // La prenotazione esiste già nell'array, quindi aggiungi solo il posto
          let posto = {
            idPosto: row.idPosto,
            numeroFila: row.numeroFila,
            posizioneFila: row.posizioneFila
          };
          existingPrenotazione.posti.push(posto);
        } else {
          // La prenotazione non esiste ancora nell'array, quindi creala insieme al posto
          let prenotazione = {
            idPrenotazione: row.idPrenotazione,
            tipoAereo: row.nomeAereo,
            modelloAereo: row.modello,
            dataPrenotazione: row.dataPrenotazione,
            posti: [{
              idPosto: row.idPosto,
              numeroFila: row.numeroFila,
              posizioneFila: row.posizioneFila
            }]
          };
          prenotazioniArray.push(prenotazione);
        }
      });

      resolve(prenotazioniArray);
    });
  });
};


//elimina prenotazione con un certo id
exports.deletePrenotazioni = (id, userId) => {
  return new Promise((resolve, reject) => {
    const Sql1 = 'DELETE FROM prenotazioni WHERE id = ? AND utenteId = ?'; 
    db.run(Sql1, [id, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }

      const Sql2 = 'UPDATE posti SET idPrenotazione = NULL WHERE idPrenotazione = ?';
      db.run(Sql2, [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(this.changes); // return the number of affected rows
      });
    });
  });
}


exports.createPrenotazione = (prenotazione) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Verifica se l'utente ha già effettuato una prenotazione sull'aereo
      const prenotazioneEsistente = await new Promise((resolve, reject) => {
        const checkPrenotazioneSql = `
          SELECT COUNT(*) as count
          FROM prenotazioni
          WHERE aereoId=? AND utenteId=?
        `;
        db.get(checkPrenotazioneSql, [prenotazione.aereoId, prenotazione.userId], function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.count > 0);
        });
      });

      if (prenotazioneEsistente) {
        reject("La prenotazione non è andata a buon fine, è ammessa solo una prenotazione ad aereo");
        return;
      }

      const posti = prenotazione.posti;
      const postiPrenotati = [];

      // Verifica se i posti sono già prenotati
      for (const posto of posti) {
        const { row, seat } = posto;

        const existingPrenotazione = await new Promise((resolve, reject) => {
          const checkPostoSql = `
            SELECT idPrenotazione
            FROM posti
            WHERE aereoId=? AND numeroFila=? AND posizioneFila=?
          `;
          db.get(checkPostoSql, [prenotazione.aereoId, row, seat], function (err, row) {
            if (err) {
              reject(err);
              return;
            }
            resolve(row);
          });
        });

        if (existingPrenotazione && existingPrenotazione.idPrenotazione !== null) {
          postiPrenotati.push({ row, seat });
        }
      }

      if (postiPrenotati.length > 0) {
        reject(postiPrenotati);
        return;
      }

      // Inserimento della prenotazione nella tabella "prenotazioni"
      const insertPrenotazioneSql = `
        INSERT INTO prenotazioni (aereoId, utenteId, dataPrenotazione)
        VALUES (?, ?, ?)
      `;
      db.run(insertPrenotazioneSql, [prenotazione.aereoId, prenotazione.userId, prenotazione.date], function (err) {
        if (err) {
          reject(err);
          return;
        }

        const prenotazioneId = this.lastID;

        // Aggiornamento dei valori della colonna "idPrenotazione" nella tabella "posti"
        for (const posto of posti) {
          const { row, seat } = posto;

          const updatePostoSql = `
            UPDATE posti
            SET idPrenotazione=?
            WHERE aereoId=? AND numeroFila=? AND posizioneFila=?
          `;
          db.run(updatePostoSql, [prenotazioneId, prenotazione.aereoId, row, seat], function (err) {
            if (err) {
              reject(err);
              return;
            }
          });
        }

        resolve(prenotazioneId);
      });
    } catch (err) {
      reject(err);
    }
  });
};
