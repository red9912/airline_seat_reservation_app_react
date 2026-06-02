'use strict';
const dayjs = require('dayjs');

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const {check, validationResult} = require('express-validator'); // validation middleware

const dao = require('./dao'); // module for accessing the DB
const userDao = require('./user-dao'); // module for accessing the user info in the DB


const app = express();
app.use(morgan('dev'));
app.use(express.json());

const port = 3001;

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');   




/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "ewfevds3",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};



/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

//FINE PASSPORT--------------------------------------------------------------------------------------------------------


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*** APIs ***/


//prende dati relativi a un determinato aereo
// GET /api/aerei/<id>
app.get('/api/aerei/:id',[ check('id').isInt({min: 1}) ], async (req, res) => {
  try {
    const resultAereo = await dao.getAereo(req.params.id);

    if (resultAereo.error)
      res.status(404).json(resultAereo);
    else {
      const result = await dao.listPostiByAereo(req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result)  
    }
  } catch(err) {
    console.log(err);
    res.status(500).end();
  }
});

//prende dati relativi a tutti gli aerei inclusi i posti
// GET /api/aerei
app.get('/api/aerei', async (req, res) => {
  try {
    
      const result = await dao.datiAerei(req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result)  
    
  } catch(err) {
    console.log(err);
    res.status(500).end();
  }
});

//restituisce le prenotazioni di un certo utente
app.get('/api/prenotazioni',
  isLoggedIn,
  (req, res) => {
    dao.listaPrenotazioni(req.user.id)
      .then(prenotazioni => res.json(prenotazioni))
      .catch((err) => res.status(500).json(err));
  }
);

// DELETE prenotazione con un certo id
app.delete('/api/prenotazioni/:id', isLoggedIn, async (req, res) => {
  try {
    const numRowChanges = await dao.deletePrenotazioni(req.params.id, req.user.id); 
    res.json(numRowChanges)
  } catch(err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion of reservation ${req.params.id}.`});
  }
});


// POST /api/prenotazioni
app.post('/api/prenotazioni', isLoggedIn, [
  check('numeroPosti').isInt({ min: 1 }),
  check('posti.*.seat').isString().isLength({ min: 1, max: 1 }).withMessage('Il campo "seat" deve essere una lettera da "a" a "f"'),
  check('posti.*.row').isInt({ min: 1 }).withMessage('Il campo "row" deve essere un numero'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const aereoId = req.body.idAereo;
  const resultAereo = await dao.getAereo(aereoId);  
  if (resultAereo.error) {
    res.status(404).json(resultAereo);
    return;
  }

  const prenotazione = {
    aereoId: aereoId,
    date: dayjs().format('YYYY-MM-DD'),
    posti: req.body.posti,
    userId: req.user.id,  
  };

  try {
    const prenotazioneId = await dao.createPrenotazione(prenotazione);
    res.status(201).json(prenotazioneId);
  } catch (err) {
    if (err === "Numero di posti disponibili non sufficienti") {
      res.status(400).json({ error: err });
    }else if(err==="La prenotazione non è andata a buon fine, è ammessa solo una prenotazione ad aereo"){
      res.status(400).json({ error: err });
    } else if(Array.isArray(err)){
      res.status(400).json({ error: "I posti evidenziati in blu sono stati appena occupati, riprovare", postiPrenotati: err });
    }
    else {
      console.log(err);
      res.status(503).json({ error: "Database error during the creation of prenotazione" });
    }
  }
});
