import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Icon,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiSearch, FiUpload, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UploadModal } from '../components/UploadModal';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { GifCard } from '../components/GifCard';

export default function Home() {
  const [search, setSearch] = useState('');
  const [showMyGifs, setShowMyGifs] = useState(false);
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();
  const { user, logout } = useAuth();

  const { data: gifs = [], isLoading } = useQuery({
    queryKey: ['gifs', search, showMyGifs, user?.id],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.q = search;
      if (showMyGifs && user) {
        params.userId = user.id.toString();
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gifs', { 
        params,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        }
      });
      return response.data;
    },
  });

  const handleUploadClick = () => {
    if (!user) {
      onAuthOpen();
    } else {
      onUploadOpen();
    }
  };

  return (
    <Box minH="100vh" bg="dark.200">
      {/* Header */}
      <Box 
        bg="dark.100" 
        borderBottom="1px" 
        borderColor="whiteAlpha.100"
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Flex direction="column">
              <Heading 
                fontSize="3xl" 
                bgGradient="linear(to-r, brand.400, brand.600)" 
                bgClip="text"
                fontWeight="bold"
              >
                Host Your GIF
              </Heading>
              <Text color="whiteAlpha.800" fontSize="sm">
                Your Personal GIF Collection
              </Text>
            </Flex>

            <Flex gap={4} align="center">
              {user ? (
                <>
                  <Button
                    onClick={() => setShowMyGifs(!showMyGifs)}
                    variant={showMyGifs ? "solid" : "ghost"}
                    size="sm"
                    leftIcon={<Icon as={FiUser} />}
                  >
                    {showMyGifs ? "Show All" : "My GIFs"}
                  </Button>
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="sm"
                    >
                      <Avatar size="sm" name={user.name} bg="brand.500" />
                    </MenuButton>
                    <MenuList bg="dark.100" borderColor="whiteAlpha.100">
                      <MenuItem 
                        onClick={logout}
                        _hover={{ bg: 'dark.200' }}
                        color="red.400"
                      >
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Button 
                  onClick={onAuthOpen}
                  variant="ghost"
                  size="sm"
                >
                  Login
                </Button>
              )}
              <Button
                onClick={handleUploadClick}
                variant="solid"
                size="sm"
                leftIcon={<Icon as={FiUpload} />}
              >
                Upload GIF
              </Button>
            </Flex>
          </Flex>

          {/* Search Bar */}
          <Box mt={6}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="whiteAlpha.400" />
              </InputLeftElement>
              <Input
                placeholder="Search GIFs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="dark.300"
                _placeholder={{ color: 'whiteAlpha.400' }}
                borderRadius="xl"
                fontSize="md"
              />
            </InputGroup>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <Grid
          templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
          gap={6}
          px={4}
        >
          {isLoading ? (
            <Text color="whiteAlpha.800">Loading...</Text>
          ) : gifs.length === 0 ? (
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              minH="200px"
              color="whiteAlpha.600"
            >
              <Text fontSize="lg">No GIFs found</Text>
              <Text fontSize="sm" mt={2}>
                {search ? 'Try a different search term' : 'Upload your first GIF!'}
              </Text>
            </Flex>
          ) : (
            gifs.map((gif: any) => (
              <GifCard key={gif.id} gif={gif} />
            ))
          )}
        </Grid>
      </Container>

      <UploadModal isOpen={isUploadOpen} onClose={onUploadClose} />
      <AuthModal isOpen={isAuthOpen} onClose={onAuthClose} />
    </Box>
  );
}
