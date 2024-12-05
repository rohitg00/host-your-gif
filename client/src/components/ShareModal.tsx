import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Button,
  Box,
  Image,
  Code,
  useToast,
  useClipboard,
  VStack,
  Text,
} from '@chakra-ui/react';

interface GifType {
  id: number;
  filename: string;
  title: string;
  created_at: string;
}

interface ShareModalProps {
  gif: GifType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ gif, isOpen, onClose }: ShareModalProps) {
  const toast = useToast();

  if (!gif) return null;

  const shareUrl = `${window.location.origin}/uploads/${gif.filename}`;
  const htmlEmbed = `<img src="${shareUrl}" alt="${gif.title}" />`;
  const markdownEmbed = `![${gif.title}](${shareUrl})`;

  const { onCopy: copyLink } = useClipboard(shareUrl);
  const { onCopy: copyHtml } = useClipboard(htmlEmbed);
  const { onCopy: copyMarkdown } = useClipboard(markdownEmbed);

  const handleCopy = (copyFn: () => void, type: string) => {
    copyFn();
    toast({
      title: 'Copied!',
      description: `${type} has been copied to clipboard`,
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg="gray.900" borderWidth={1} borderColor="whiteAlpha.200">
        <ModalHeader borderBottomWidth={1} borderColor="whiteAlpha.100">
          Share GIF
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <Tabs variant="soft-rounded" colorScheme="purple">
            <TabList mb={4}>
              <Tab>Direct Link</Tab>
              <Tab>HTML Embed</Tab>
              <Tab>Markdown</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box borderRadius="md" overflow="hidden" maxW="300px" mx="auto">
                    <Image src={shareUrl} alt={gif.title} />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" color="whiteAlpha.700">Direct link to your GIF:</Text>
                    <Input
                      value={shareUrl}
                      readOnly
                      pr="4.5rem"
                      bg="gray.800"
                      borderColor="whiteAlpha.200"
                    />
                    <Button
                      position="absolute"
                      right={4}
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      onClick={() => handleCopy(copyLink, 'Direct link')}
                      colorScheme="purple"
                      variant="ghost"
                    >
                      Copy
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box bg="gray.800" p={4} borderRadius="md">
                    <Code display="block" whiteSpace="pre" children={htmlEmbed} />
                  </Box>
                  <Box position="relative">
                    <Text mb={2} fontSize="sm" color="whiteAlpha.700">HTML embed code:</Text>
                    <Input
                      value={htmlEmbed}
                      readOnly
                      pr="4.5rem"
                      bg="gray.800"
                      borderColor="whiteAlpha.200"
                    />
                    <Button
                      position="absolute"
                      right={4}
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      onClick={() => handleCopy(copyHtml, 'HTML code')}
                      colorScheme="purple"
                      variant="ghost"
                    >
                      Copy
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box bg="gray.800" p={4} borderRadius="md">
                    <Code display="block" whiteSpace="pre" children={markdownEmbed} />
                  </Box>
                  <Box position="relative">
                    <Text mb={2} fontSize="sm" color="whiteAlpha.700">Markdown code:</Text>
                    <Input
                      value={markdownEmbed}
                      readOnly
                      pr="4.5rem"
                      bg="gray.800"
                      borderColor="whiteAlpha.200"
                    />
                    <Button
                      position="absolute"
                      right={4}
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      onClick={() => handleCopy(copyMarkdown, 'Markdown code')}
                      colorScheme="purple"
                      variant="ghost"
                    >
                      Copy
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
