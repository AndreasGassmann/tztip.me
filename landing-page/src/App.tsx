import React from 'react';
import Header from './Header';
import Logo from './logo.png';
import Name from './name.png';
import Beacon from './beacon-logo.svg';
import AirGap from './airgap_logo.svg';
import { FaDiscord, FaTelegram } from 'react-icons/fa';

import { Heading, Stack, Flex, Box, Grid, Image, Link, Text, Button } from '@chakra-ui/core';

const App = () => {
  return (
    <>
      <Header />
      <Grid>
        <Box w="100%" paddingBottom="40px" textAlign="center" justifyItems="justify">
          <Flex justify="center">
            <img src={Name} width="200px"></img>
          </Flex>
          <Flex justify="center">
            <img src={Logo} width="200px"></img>
          </Flex>
          <Flex paddingTop="20px" justify="center">
            <Text fontSize="lg">Easy Tips on Tezos</Text>
          </Flex>

          <Flex paddingTop="50px" justify="center">
            <Link href="https://discord.gg/bDXqrdS" isExternal>
              <Button margin="10px">
                <Box as={FaDiscord} />
                <Text paddingLeft="10px">Discord</Text>
              </Button>
            </Link>
            <Link href="https://telegram.me/tztipbot" isExternal>
              <Button margin="10px">
                <Box as={FaTelegram} />
                <Text paddingLeft="10px">Telegram</Text>
              </Button>
            </Link>
          </Flex>
        </Box>
      </Grid>
      <Grid>
        <Box w="100%" paddingTop="40px" paddingBottom="40px" textAlign="center" bg="#F9F9F9">
          Enable Tezos Tips on any website or platform. Use your <b>mobile wallet</b> to tip. Funds are transferred
          directly from one user to the other. TzTip has no access to your balance.
        </Box>
      </Grid>
      <Grid>
        <Box w="100%" paddingTop="40px" paddingBottom="40px" textAlign="center">
          <Flex justify="center" paddingBottom="20px">
            <Heading as="h2" size="md">
              How it works
            </Heading>
          </Flex>
          <Flex justify="center">
            <iframe width="550" height="310" src="https://www.youtube.com/embed/jprOA6Paq4o"></iframe>
          </Flex>
        </Box>
      </Grid>
      <Grid>
        <Box w="100%" paddingTop="40px" paddingBottom="40px" textAlign="center" bg="#F9F9F9">
          Communication between TzTip and wallets is using the beacon network, a distributed P2P network. Anyone can
          participate.
          <Link href="https://walletbeacon.io" isExternal>
            <img src={Beacon} width="200px"></img>
          </Link>
        </Box>
      </Grid>

      <Grid>
        <Box w="100%" paddingTop="40px" paddingBottom="40px" textAlign="center" bg="#F9F9F9">
          <Link href="https://airgap.it" isExternal>
            <img src={AirGap} width="200px"></img>
          </Link>
        </Box>
      </Grid>

      <Grid>
        <Box w="100%" paddingTop="40px" paddingBottom="40px" textAlign="center">
          <Text>Made with ☕ and 🍫 in Switzerland</Text>
        </Box>
      </Grid>
    </>
  );
};

export default App;
