import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  Flex,
  useToast,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { FiLock, FiGlobe, FiShare2, FiCopy } from 'react-icons/fi';
import ShareModal from './ShareModal';

interface GifCardProps {
  gif: {
    id: number;
    title: string;
    filename: string;
    filepath: string;
    shareUrl: string;
    isPublic: boolean;
    created_at: string;
  };
}

export function GifCard({ gif }: GifCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { onCopy } = useClipboard(gif.shareUrl);
  const toast = useToast();

  const handleCopyLink = () => {
    onCopy();
    toast({
      title: 'Link copied!',
      status: 'success',
      duration: 2000,
      position: 'bottom-right',
      variant: 'subtle',
    });
  };

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg="dark.100"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '2xl',
        borderColor: 'brand.500',
      }}
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={gif.filepath}
          alt={gif.title}
          w="100%"
          h="auto"
          objectFit="cover"
          loading="lazy"
          transition="transform 0.3s ease"
          _hover={{ transform: 'scale(1.05)' }}
        />
        <Flex
          position="absolute"
          top={2}
          right={2}
          gap={2}
        >
          <Tooltip 
            label={gif.isPublic ? 'Public GIF' : 'Private GIF'} 
            placement="top"
          >
            <IconButton
              aria-label={gif.isPublic ? 'Public' : 'Private'}
              icon={gif.isPublic ? <FiGlobe /> : <FiLock />}
              size="sm"
              variant="solid"
              bg="blackAlpha.600"
              _hover={{ bg: 'blackAlpha.800' }}
            />
          </Tooltip>
          <Tooltip label="Share GIF" placement="top">
            <IconButton
              aria-label="Share GIF"
              icon={<FiShare2 />}
              onClick={() => setIsShareModalOpen(true)}
              size="sm"
              variant="solid"
              bg="blackAlpha.600"
              _hover={{ bg: 'blackAlpha.800' }}
            />
          </Tooltip>
          <Tooltip label="Copy link" placement="top">
            <IconButton
              aria-label="Copy link"
              icon={<FiCopy />}
              onClick={handleCopyLink}
              size="sm"
              variant="solid"
              bg="blackAlpha.600"
              _hover={{ bg: 'blackAlpha.800' }}
            />
          </Tooltip>
        </Flex>
      </Box>
      <Box p={4}>
        <Text 
          fontWeight="medium" 
          noOfLines={1}
          title={gif.title}
        >
          {gif.title}
        </Text>
      </Box>

      <ShareModal
        gif={gif}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </Box>
  );
}
