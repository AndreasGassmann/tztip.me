require('dotenv').config();
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { TipResponse, AccountInfoResponse } from '../../../beacon/types';
const qr = require('qr-image');
const fs = require('fs');
const axios = require('axios');

const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN : '', {
  polling: true,
});
const app = express();
app.use(express.json());

const port = 3001;
const beaconUrl = 'http://localhost:3000';

var chatId: any;

app.post('/bot/qr', async (req, res) => {
  return res.send('Received a GET HTTP method');
});

app.post('/bot/connected', async (req, res) => {
  const accountInfoResponse = req.body as AccountInfoResponse;
  telegramBot.sendMessage(chatId, `Connected to ${accountInfoResponse.accountInfo.address}`);
  return res.send('ok');
});

app.post('/bot/sent', async (req, res) => {
  const tipResponse = req.body as TipResponse;
  telegramBot.sendMessage(
    chatId,
    `${Number(tipResponse.recipients[0].amount) / 1000000}tz sent to @${
      tipResponse.recipients[0].user.id
    }. https://tezblock.io/transaction/${tipResponse.transactionId}`
  );
  return res.send('ok');
});

app.listen(port, () => console.log(`Telegram bot app listening on port ${port}!`));

async function sendErrorReply(chatId: number, error: Error) {
  console.log(error);
  await telegramBot.sendMessage(chatId, `There was error with your command:"${error.message}"`);
}

async function wrapForErrorHandling(chatId: number, callback: () => void) {
  try {
    await callback();
  } catch (e) {
    sendErrorReply(chatId, e);
  }
}

telegramBot.onText(/\/connect/, (msg, match) => {
  wrapForErrorHandling(msg.chat.id, async () => {
    chatId = msg.chat.id;
    telegramBot.sendMessage(msg.chat.id, 'Connecting, please wait...');
    const response = await axios.post(beaconUrl + '/beacon/init', { user: { provider: 'telegram', id: msg.chat.id } });
    console.log('bla', response);
    telegramBot.sendMessage(msg.chat.id, JSON.stringify(response.data));
    var qr_svg = qr.image(JSON.stringify(response.data), { type: 'png' });
    var writeStream = fs.createWriteStream('qr.png');
    qr_svg.pipe(writeStream);
    writeStream.on('finish', () => {
      fs.readFile('qr.png', function (err, data) {
        if (err) throw err; // Fail if the file can't be read.
        telegramBot.sendPhoto(msg.chat.id, data);
      });
    });
  });
});

telegramBot.onText(/\/tip (@.+) ([0-9]+)/, (msg, match) => {
  wrapForErrorHandling(msg.chat.id, async () => {
    if (!match) {
      return;
    }
    chatId = msg.chat.id;
    let user = match ? match[1] : '0';
    let amount = (parseFloat(match ? match[2] : '1') * 1000000).toString();
    console.log('match', match);
    telegramBot.sendMessage(
      msg.chat.id,
      'Sending ' + Number(amount) / 1000000 + ' XTZ to ' + user + ', please wait...'
    );
    axios.post(beaconUrl + '/beacon/tip', {
      from: { provider: 'telegram', id: msg.chat.id },
      recipients: [{ user: { provider: 'telegram', id: msg.chat.id }, amount }],
    });
  });
});
