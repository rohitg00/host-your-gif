import { Box, Text, Flex, useColorMode } from '@chakra-ui/react';

export function Logo() {
  const { colorMode } = useColorMode();

  return (
    <Flex direction="column" align="center" position="relative">
      <Box
        position="relative"
        width="50px"
        height="50px"
        mb={2}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgGradient="linear(to-r, blue.400, purple.500)"
          borderRadius="full"
          transform="rotate(45deg)"
          _before={{
            content: '""',
            position: 'absolute',
            width: '70%',
            height: '70%',
            top: '15%',
            left: '15%',
            borderRadius: 'full',
            bg: colorMode === 'dark' ? 'dark.200' : 'white',
          }}
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgGradient="linear(to-l, purple.500, blue.400)"
          borderRadius="full"
          transform="rotate(-45deg)"
          _before={{
            content: '""',
            position: 'absolute',
            width: '70%',
            height: '70%',
            top: '15%',
            left: '15%',
            borderRadius: 'full',
            bg: colorMode === 'dark' ? 'dark.200' : 'white',
          }}
        />
      </Box>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        bgGradient="linear(to-r, blue.400, purple.500)"
        bgClip="text"
        letterSpacing="tight"
      >
        Host Your GIF
      </Text>
    </Flex>
  );
} 