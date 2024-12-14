import React, { useState, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  Tooltip,
  Flex,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Skeleton,
  useColorMode,
} from '@chakra-ui/react';
import { FiLock, FiGlobe, FiShare2, FiCopy, FiTrash2 } from 'react-icons/fi';
import { ShareModal } from './ShareModal';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface GifCardProps {
  gif: {
    id: number;
    userId: number;
    title: string;
    filepath: string;
    shareUrl: string;
    isPublic: boolean;
  };
  user: any;
}

export default function GifCard({ gif, user }: GifCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { authToken } = useAuth();
  const { colorMode } = useColorMode();

  const handleDelete = async () => {
    try {
      if (!authToken) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to delete GIFs',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await axios.delete(`/api/gifs/${gif.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['gifs'] });
      toast({
        title: 'GIF deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting GIF:', error);
      toast({
        title: 'Error deleting GIF',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gif.shareUrl);
    toast({
      title: 'Link copied!',
      status: 'success',
      duration: 2000,
    });
  };

  const canDelete = user && gif.userId === user.id;

  return (
    <Box
      role="group"
      bg={colorMode === 'dark' ? 'dark.100' : 'white'}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
      boxShadow="md"
      position="relative"
      width="100%"
      height="fit-content"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.100'}
    >
      <Box position="relative" paddingTop="75%" bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'}>
        <Image
          src={gif.filepath}
          alt={gif.title}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          fallback={<Skeleton height="100%" position="absolute" top={0} left={0} />}
        />
        {!gif.isPublic && (
          <Box
            position="absolute"
            top={2}
            right={2}
            p={1}
            borderRadius="md"
            bg={colorMode === 'dark' ? 'blackAlpha.600' : 'whiteAlpha.800'}
          >
            <Tooltip label="Private GIF">
              <Box>
                <FiLock color={colorMode === 'dark' ? 'white' : 'black'} />
              </Box>
            </Tooltip>
          </Box>
        )}
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          p={3}
          direction="column"
          justify="space-between"
          bgGradient={colorMode === 'dark' 
            ? 'linear(to-b, transparent 0%, rgba(0,0,0,0.7) 100%)'
            : 'linear(to-b, transparent 0%, rgba(0,0,0,0.5) 100%)'}
          opacity={0}
          transition="opacity 0.2s"
          _groupHover={{ opacity: 1 }}
        >
          <Flex justify="space-between" align="center">
            <Tooltip label={gif.isPublic ? 'Public GIF' : 'Private GIF'} placement="top">
              <IconButton
                aria-label={gif.isPublic ? 'Public GIF' : 'Private GIF'}
                icon={gif.isPublic ? <FiGlobe /> : <FiLock />}
                size="sm"
                variant="ghost"
                color="white"
                bg="blackAlpha.600"
                _hover={{ bg: 'blackAlpha.800' }}
              />
            </Tooltip>

            {canDelete && (
              <Tooltip label="Delete GIF" placement="top">
                <IconButton
                  aria-label="Delete GIF"
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  bg="red.500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  _hover={{ bg: 'red.600', transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                />
              </Tooltip>
            )}
          </Flex>

          <Flex gap={2} justify="flex-end">
            <Tooltip label="Copy link" placement="top">
              <IconButton
                aria-label="Copy link"
                icon={<FiCopy />}
                size="sm"
                variant="ghost"
                color="white"
                bg="blackAlpha.600"
                onClick={handleCopyLink}
                _hover={{ bg: 'blackAlpha.800' }}
              />
            </Tooltip>
            <Tooltip label="Share" placement="top">
              <IconButton
                aria-label="Share"
                icon={<FiShare2 />}
                size="sm"
                variant="ghost"
                color="white"
                bg="blackAlpha.600"
                onClick={() => setIsShareModalOpen(true)}
                _hover={{ bg: 'blackAlpha.800' }}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </Box>

      <Box
        p={3}
        bg={gif.isPublic 
          ? (colorMode === 'dark' ? 'dark.100' : 'white')
          : (colorMode === 'dark' ? 'purple.900' : 'purple.50')}
        borderTop="1px"
        borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100'}
      >
        <Text
          color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}
          noOfLines={1}
          fontWeight="medium"
          fontSize="sm"
        >
          {gif.title}
        </Text>
      </Box>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colorMode === 'dark' ? 'dark.100' : 'white'}>
            <AlertDialogHeader>Delete GIF</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this GIF? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        gifUrl={gif.shareUrl}
        previewUrl={gif.filepath}
      />
    </Box>
  );
}
