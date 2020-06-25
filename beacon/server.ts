import { InitRequest, SetAddressRequest, TipRequest, TipResponse, InitResponse, Provider } from './types';
import { connect, tip } from './beacon';

import express = require('express');
import Axios from 'axios';
import { discordUrl, telegramUrl } from './constants';
const app: express.Application = express();
app.use(express.json());

app.get('/', function (req, res) {
  res.send('Running');
});

app.post('/beacon/init', async (req, res) => {
  const body: InitRequest = req.body;

  if (!body.user) {
    throw new Error('User not set');
  }
  if (!body.user.provider) {
    throw new Error('User Provider not set');
  }
  if (!body.user.id) {
    throw new Error('User ID not set');
  }

  const qrData = await connect(body.user);

  console.log('qrData', qrData);

  if (typeof qrData === 'boolean' && qrData) {
    res.json(true);
  } else {
    const response: InitResponse = qrData;
    res.json(response);
  }
});

app.post('/beacon/set-address', function (req, res) {
  const body: SetAddressRequest = req.body;

  // set db
  const address: string | undefined = undefined;

  res.json({ success: false });
});

app.post('/beacon/tip', function (req, res) {
  const body: TipRequest = req.body;

  tip(body.from, body.recipients).then((result) => {
    console.log('send response!');
    Axios.post(`${body.from.provider === Provider.DISCORD ? discordUrl : telegramUrl}/bot/sent`, {
      transactionId: result.transactionHash,
      from: body.from,
      recipients: body.recipients,
    });
  });

  const response: TipResponse = {
    transactionId: '',
    from: body.from,
    recipients: [],
  };
  res.json(response);
});

app.listen(3000, function () {
  console.log('App is listening on port 3000!');
});
