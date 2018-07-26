require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUnitialized: false
}));

app.get('/callback', async (req, res) => {
  const { REACT_APP_AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, REACT_APP_AUTH0_DOMAIN } = process.env

  const payload = {
    client_id: REACT_APP_AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri: `http://${req.headers.host}/callback`
  };

  let accessToken = await axios.post(`https://${REACT_APP_AUTH0_DOMAIN}/oauth/token`, payload);
  let userInfo = await axios.get(`https://${REACT_APP_AUTH0_DOMAIN}/userinfo?access_token=${accessToken.data.access_token}`);

  req.session.user = userInfo.data;
  res.redirect('/');
});

app.get('/api/user-data', (req, res) => {
  res.status(200).json(req.session.user)
})

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('logged out');
})

// app.put("/api/star", (req, res) => {
//   const{gitUser, gitRepo} = req.query
// });

const port = 4000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });
