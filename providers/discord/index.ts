import { TipResponse, AccountInfoResponse, Provider } from '../../beacon/types';
const axios = require('axios');

const QRCode = require('qrcode');
var MemoryStream = require('memorystream');

import { Client } from 'discord.js';

const Discord = require('discord.js');
const client = new Client();

import express = require('express');
const app: express.Application = express();
app.use(express.json());

const port = 3002;
const beaconUrl = 'http://localhost:3000';

app.post('/bot/qr', async (req, res) => {
  return res.send('Received a GET HTTP method');
});

app.get('/', async (req, res) => {
  return res.send('Running');
});

app.post('/bot/connected', async (req, res) => {
  const connectedResponse = req.body as AccountInfoResponse;
  console.log('connectedResponse', connectedResponse);
  client.users.resolve(connectedResponse.from.id).send({
    content: 'Connected!',
    embed: {
      url: 'https://tztip.me',
      color: 1946875,
      timestamp: new Date(),
      footer: {
        icon_url: 'https://tztip.me/static/media/logo.476721ba.png',
        text: 'Beacon',
      },
      thumbnail: {
        url: 'https://tztip.me/static/media/logo.476721ba.png',
      },
      fields: [
        {
          name: 'Address',
          value: connectedResponse.accountInfo.address,
        },
      ],
    },
  });
  return res.send('ok');
});

app.post('/bot/sent', async (req, res) => {
  const tipResponse = req.body as TipResponse;
  client.users
    .resolve(tipResponse.from.id)
    .send(`Transaction sent! https://tezblock.io/transaction/${tipResponse.transactionId}`);

  // TODO: Send notifications to recipients

  return res.send('ok');
});

app.listen(port, () => console.log(`Discord bot app listening on port ${port}!`));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  console.log(msg.author.username, msg.content);
  if (msg.content === '!connect') {
    msg.reply('Connecting, please wait... The response will be sent to you via DM!');
    const response = await axios.post(beaconUrl + '/beacon/init', {
      user: { provider: Provider.DISCORD, id: msg.author.id },
    });

    var memStream = new MemoryStream();
    QRCode.toFileStream(memStream, JSON.stringify(response.data));
    const attachment = new Discord.MessageAttachment(memStream, 'beacon.png');
    client.users.resolve(msg.author.id).send(`Scan this with a beacon compatible wallet!`, attachment);
    client.users.resolve(msg.author.id).send(JSON.stringify(response.data));
    // var qr_svg = qr.image(JSON.stringify(response.data), { type: 'png' });
    // var writeStream = fs.createWriteStream('qr.png')
    // qr_svg.pipe(writeStream);
    // writeStream.on('finish', () => {
    // 		fs.readFile('qr.png', function (err, data) {
    // 				if (err) throw err; // Fail if the file can't be read.
    // 				telegramBot.sendPhoto(msg.chat.id, data)
    // 		});
    // });
    // setTimeout(() => {
    //   console.log("globalSyncInfo", JSON.stringify(globalSyncInfo));
    //
    // }, 10000);
  }
  if (msg.content === '!permission') {
    msg.channel.send(`Request has been sent to your wallet!`);

    // const response = await beaconClient.requestPermissions();

    // msg.channel.send({
    //   content: "Permission granted",
    //   embed: {
    //     url: "https://walletbeacon.io",
    //     color: 1946875,
    //     timestamp: new Date(),
    //     footer: {
    //       icon_url: "https://www.walletbeacon.io/assets/icon/favicon.png",
    //       text: "Beacon",
    //     },
    //     thumbnail: {
    //       url: "https://www.walletbeacon.io/assets/icon/favicon.png",
    //     },
    //     author: {
    //       name: "AirGap Wallet",
    //       url: "https://walletbeacon.io",
    //       icon_url: "https://www.walletbeacon.io/assets/icon/favicon.png",
    //     },
    //     fields: [
    //       {
    //         name: "Address",
    //         value: response.address,
    //       },
    //       {
    //         name: "Network",
    //         value: response.network.type,
    //       },
    //       {
    //         name: "Scopes",
    //         value: response.scopes,
    //       },
    //     ],
    //   },
    // });
  }
  if (msg.content.startsWith('!tip')) {
    msg.reply('Sent request to your wallet!');
    console.log(msg.content.split(' '));
    const amount = parseInt(msg.content.split(' ')[2]) * 1000000;

    const members: any[] = msg.mentions.members ? (msg.mentions.members as any) : [{ id: '136447902238244864' }];

    if (members) {
      const recipients = members.map((member) => {
        return { user: { provider: Provider.DISCORD, id: member.id }, amount: amount.toString() };
      });

      console.log('recipients', recipients);

      axios.post(beaconUrl + '/beacon/tip', {
        from: { provider: Provider.DISCORD, id: msg.author.id },
        recipients: recipients,
      });
    } else {
      console.log('NOT SENDING', members);
    }
  }
});

client.login('');
