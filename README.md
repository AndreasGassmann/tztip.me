# TzTip.me

This project was created for the [Coinlist Tezos Hackathon](https://coinlist.co/build/tezos).

## What is it?

TzTip.me is a tipping service that allows developers to add tipping functionality to any platform while letting the users keep ownership of their funds.

## Motivation

Tip bots usually work by storing all the funds on a central address that is controlled by the bot owner. The bot keeps a database of all the balances, but the users don't actually own the money in their accounts. Users have to explicitly "withdraw" the money to get it into their own, secure, wallet. The downside is that the bot owner has full control over all the funds that are in circulation. So there is always a chance that the funds will get stolen.

In our approach, this is not the case. The user uses his own mobile/desktop/browser wallet and only he controls his private key. In the past, the problem with this approach was that there was no user friendly way of connecting tip bots with wallets.

We solve this problem by using [Beacon](https://walletbeacon.io/). It allows us to establish a connection between the server and the wallet. Once the connection is established, the bot can send requests to the wallet and the user simply needs to confirm them. We showcase the "tipping" functionality here, but the system is not limited to simple spend transactions.

## Collectibles / Games

The bot can send any type of request, such as delegation requests or contract calls. This opens the door to many applications, such as a collectible trading bots or interactive games on the blockchain. Those bots could give live updates, status reports and offer intuitive ways of interacting with a smart contract, which then result in a single transaction that is sent to the users wallet.

## Future

By leveraging the message signing feature of a wallet, it might be possible to improve the tipping system and introduce a lightning-network-style system that would allow for completely fee-less tipping.

## Architecture

The project consists of 3 separate projects

### Beacon Service

The "beacon" service is the one managing the connections to the wallets, and storing a list of userIDs <=> tz addresses.

### Providers (Discord & Telegram)

There are 2 "provider" microservices to showcase the usage of our service on 2 different platforms. The 2 providers are "Discord" and "Telegram". The providers' job is to receive and send messages to the user. When the user first interacts with one of the providers, he has to call the "connect" command and will be given a QR and JSON-code. The user can then either scan the QR code or copy/paste the JSON-code into his wallet, whatever is easier. This will establish the connection between the wallet and the backend. After this is done, the user can use the "tip" command, where he sends a specific amount to other users. This request is sent to the "beacon" service, which gets the corresponding addresses for the users and prepares/sends the request to the users wallet. All the state is managed in the "beacon service", the 2 providers are stateless.

Other providers and platforms can be added: Slack, Facebook Messenger, but even websites such as Twitter.

## Setup

- Run `npm install` in all the project folders with a package.json.

- To run the `discord` provider, you have to provide a bot token in the `index.ts` file.

- To run the `telegram` provider, you have to provide a bot token in the `index.ts` file.

## Status

It can be seen as a functional proof of concept. It is not ready for production yet.
