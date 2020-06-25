import React from 'react';
import { IconButton, Box, Heading, Flex, Text, Button, Link } from '@chakra-ui/core';
// 1. import the icon from "react-icons"
import { FaGithub } from 'react-icons/fa';

const Header = (props: any) => {
  const [show, setShow] = React.useState(false);

  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" {...props}>
      <Box alignItems="center" flexGrow={1}></Box>

      <Link href="https://github.com/AndreasGassmann/tztip.me" isExternal>
        <Button bg="transparent">
          <Box as={FaGithub} />
        </Button>
      </Link>
    </Flex>
  );
};

export default Header;
