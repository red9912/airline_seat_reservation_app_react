import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { React, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { Col, Container, Row, Spinner, Toast } from 'react-bootstrap';
import DefaultRoute from './components/DefaultRoute';
import API from './API';
import Navigation from './components/Navigation';
import { LoginLayout } from './components/Auth';
import PageLayout from './components/PageLayout';
import './App.css'
import { UserContext, MessageContext, DirtyContext } from './Context';



function App() {

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);

  const [aerei, setAerei] = useState([])

  const [loading, setLoading] = useState(true);

  const [dirty, setDirty] = useState(true);

  const [message, setMessage] = useState('');

  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); 
  }

  function triggerDirty(trig) {
    setDirty(trig);
  }


  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        API.getAllAerei().then((a) => setAerei(a))
          .catch((err) => console.log(err));
        const user = await API.getUserInfo();  
        setUser(user);
        setLoggedIn(true);
        setLoading(false);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
        setLoading(false);
      }
    };
    init();
  }, []);  


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setDirty(true);
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  const handleCancelLogin = () => {
    setDirty(true);
  };


  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user: user, loggedIn: loggedIn }}>
        <DirtyContext.Provider value={{ dirty: dirty, triggerDirty: triggerDirty }}>
          <MessageContext.Provider value={{ handleErrors: handleErrors, message: message, setMessage: setMessage}}>
            <Container fluid className="App">
              <Navigation logout={handleLogout} user={user} loggedIn={loggedIn} />
              <Routes>
                <Route path='/' element={<PageLayout aerei={aerei} loading={loading} />}></Route>
                <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} onCancel={handleCancelLogin}/> : <Navigate replace to='/' />} />
                <Route path='/*' element={<DefaultRoute />} />
              </Routes>
            </Container>
          </MessageContext.Provider>
        </DirtyContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App
