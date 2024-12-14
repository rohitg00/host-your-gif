import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Image,
  useColorMode,
  Flex,
  Code,
} from '@chakra-ui/react';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gifUrl: string;
  previewUrl: string;
}

export function ShareModal({ isOpen, onClose, gifUrl, previewUrl }: ShareModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copied to clipboard!',
      status: 'success',
      duration: 2000,
    });
  };

  const shareOptions = [
    {
      label: 'Direct Link',
      content: gifUrl,
    },
    {
      label: 'HTML Embed',
      content: `<img src="${gifUrl}" alt="GIF" />`,
    },
    {
      label: 'Markdown',
      content: `![GIF](${gifUrl})`,
    },
    {
      label: 'Reddit',
      content: `[GIF](${gifUrl})`,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={colorMode === 'dark' ? 'dark.100' : 'white'}>
        <ModalHeader borderBottomWidth="1px" borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100'}>
          Share GIF
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
            {/* Preview Section */}
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Preview
              </Text>
              <Box
                borderRadius="md"
                overflow="hidden"
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'}
                bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'}
                position="relative"
                paddingTop="75%"
              >
                <Image
                  src={previewUrl}
                  alt="GIF Preview"
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  objectFit="contain"
                />
              </Box>
            </Box>

            {/* Share Options Section */}
            <VStack flex="1" spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium">
                Share Options
              </Text>
              <Tabs variant="soft-rounded" colorScheme="purple" size="sm">
                <TabList>
                  {shareOptions.map((option) => (
                    <Tab
                      key={option.label}
                      fontSize="xs"
                      px={3}
                      _selected={{
                        bg: colorMode === 'dark' ? 'brand.500' : 'brand.400',
                        color: 'white',
                      }}
                    >
                      {option.label}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels mt={4}>
                  {shareOptions.map((option) => (
                    <TabPanel key={option.label} p={0}>
                      <VStack spacing={2} align="stretch">
                        <InputGroup size="sm">
                          <Input
                            value={option.content}
                            readOnly
                            pr="4.5rem"
                            fontFamily="mono"
                            fontSize="xs"
                            bg={colorMode === 'dark' ? 'dark.300' : 'gray.50'}
                          />
                          <InputRightElement width="4.5rem">
                            <Button
                              h="1.4rem"
                              size="xs"
                              onClick={() => handleCopy(option.content, option.label)}
                              leftIcon={copiedField === option.label ? <FiCheck /> : <FiCopy />}
                              colorScheme={copiedField === option.label ? 'green' : 'gray'}
                              variant="ghost"
                            >
                              {copiedField === option.label ? 'Copied' : 'Copy'}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <Code
                          p={2}
                          borderRadius="md"
                          fontSize="xs"
                          bg={colorMode === 'dark' ? 'dark.300' : 'gray.50'}
                        >
                          {option.content}
                        </Code>
                      </VStack>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </VStack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
