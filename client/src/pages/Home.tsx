import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
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
  SimpleGrid,
  Skeleton,
  Center,
  Spinner,
  IconButton,
  useColorMode,
  Link,
  Alert,
  AlertIcon,
  VStack,
  Image,
} from '@chakra-ui/react';
import { FiSearch, FiUpload, FiUser, FiSun, FiMoon, FiGithub, FiHeart } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UploadModal } from '../components/UploadModal';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import GifCard from '../components/GifCard';
import { Logo } from '../components/Logo';

interface Gif {
  id: number;
  title: string;
  filename: string;
  filepath: string;
  userId: number;
  isPublic: boolean;
  shareUrl: string;
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [showMyGifs, setShowMyGifs] = useState(false);
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();
  const { user, logout, authToken } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  const { data: gifs = [], isLoading, refetch, error } = useQuery<Gif[]>({
    queryKey: ['gifs', search, showMyGifs, user?.id],
    queryFn: async () => {
      try {
        const params = {
          q: search || undefined,
          userId: showMyGifs ? user?.id : undefined
        };

        // Only include auth header if user is logged in
        const config = {
          params,
          headers: user ? { Authorization: `Bearer ${authToken}` } : {}
        };

        const response = await axios.get('/api/gifs', config);
        return response.data;
      } catch (error) {
        console.error('Error fetching GIFs:', error);
        return [];
      }
    },
    enabled: !showMyGifs || !!user
  });

  const filteredGifs = gifs;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleUploadClick = () => {
    if (!user) {
      onAuthOpen();
    } else {
      onUploadOpen();
    }
  };

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  if (error) {
    return (
      <Center h="100vh">
        <Text>Error loading GIFs. Please try again later.</Text>
      </Center>
    );
  }

  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      {/* Header */}
      <Box 
        bg={colorMode === 'dark' ? 'dark.100' : 'white'} 
        borderBottom="1px" 
        borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'}
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Flex direction="row" align="center" gap={3}>
              <Logo />
              <Text 
                color={colorMode === 'dark' ? 'whiteAlpha.800' : 'gray.600'} 
                fontSize="sm"
                ml={4}
                px={3}
                py={1}
                borderRadius="full"
                bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50'}
              >
                {showMyGifs ? 'Your GIFs' : 'All Public GIFs'}
              </Text>
            </Flex>

            <Flex gap={4} align="center">
              <Link
                href="https://github.com/rohitg00/host-your-gif"
                target="_blank"
                rel="noopener noreferrer"
                display="flex"
                alignItems="center"
                gap={3}
                bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                px={4}
                py={2}
                borderRadius="full"
                transition="all 0.2s"
                _hover={{ 
                  bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                boxShadow="sm"
                border="1px solid"
                borderColor={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.200'}
              >
                <Flex align="center" gap={2}>
                  <Icon 
                    as={FiGithub} 
                    boxSize={5}
                    color={colorMode === 'dark' ? 'white' : 'gray.700'} 
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colorMode === 'dark' ? 'white' : 'gray.700'}
                  >
                    Star on GitHub
                  </Text>
                </Flex>
                <Box
                  bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === 'dark' ? 'white' : 'gray.700'}
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                >
                  <iframe
                    src="https://ghbtns.com/github-btn.html?user=rohitg00&repo=host-your-gif&type=star&count=true"
                    frameBorder="0"
                    scrolling="0"
                    width="100"
                    height="20"
                    title="GitHub Stars"
                    style={{
                      filter: colorMode === 'dark' ? 'invert(1)' : 'none',
                      marginTop: '2px'
                    }}
                  />
                </Box>
              </Link>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
              {user ? (
                <>
                  <Button
                    onClick={() => setShowMyGifs(!showMyGifs)}
                    variant={showMyGifs ? "solid" : "ghost"}
                    colorScheme="purple"
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
                    <MenuList bg={colorMode === 'dark' ? 'dark.100' : 'white'} borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'}>
                      <MenuItem 
                        onClick={logout}
                        _hover={{ bg: colorMode === 'dark' ? 'dark.200' : 'gray.100' }}
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
                  colorScheme="purple"
                  size="sm"
                >
                  Login
                </Button>
              )}
              <Button
                onClick={handleUploadClick}
                variant="solid"
                colorScheme="purple"
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
                <Icon as={FiSearch} color={colorMode === 'dark' ? 'whiteAlpha.400' : 'gray.400'} />
              </InputLeftElement>
              <Input
                placeholder="Search GIFs..."
                value={search}
                onChange={handleSearchChange}
                bg={colorMode === 'dark' ? 'dark.300' : 'white'}
                _placeholder={{ color: colorMode === 'dark' ? 'whiteAlpha.400' : 'gray.400' }}
                borderRadius="xl"
                fontSize="md"
              />
            </InputGroup>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Box flex="1">
        <Container maxW="container.xl" py={8}>
          <Box mt={8}>
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={6}
              w="100%"
            >
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <Box
                    key={i}
                    bg={colorMode === 'dark' ? 'dark.100' : 'white'}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="lg"
                  >
                    <Skeleton height="200px" />
                    <Box p={4}>
                      <Skeleton height="20px" width="60%" />
                    </Box>
                  </Box>
                ))
              ) : filteredGifs.length === 0 ? (
                <Box
                  gridColumn={{ base: "1", sm: "1 / -1" }}
                  textAlign="center"
                  py={10}
                >
                  <Text color={colorMode === 'dark' ? 'whiteAlpha.800' : 'gray.600'} fontSize="lg">
                    {showMyGifs
                      ? "You haven't uploaded any GIFs yet"
                      : "No GIFs found"}
                  </Text>
                  {showMyGifs && (
                    <Button
                      mt={4}
                      colorScheme="purple"
                      leftIcon={<Icon as={FiUpload} />}
                      onClick={handleUploadClick}
                    >
                      Upload your first GIF
                    </Button>
                  )}
                </Box>
              ) : (
                filteredGifs.map((gif: Gif) => (
                  <GifCard key={gif.id} gif={gif} user={user} />
                ))
              )}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        py={6}
        bg={colorMode === 'dark' ? 'dark.100' : 'white'}
        borderTop="1px"
        borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'}
        mt="auto"
      >
        <Container maxW="container.xl">
          <VStack spacing={4}>
            <Flex justify="center" align="center" gap={2} flexWrap="wrap">
              <Text>Made with</Text>
              <Icon as={FiHeart} color="red.400" />
              <Text>by</Text>
              <Link
                href="https://github.com/rohitg00"
                target="_blank"
                rel="noopener noreferrer"
                color={colorMode === 'dark' ? 'brand.300' : 'brand.500'}
                fontWeight="medium"
              >
                Rohit Ghumare
              </Link>
              <Text>•</Text>
              <Text>Hosted on</Text>
              <Link
                href="https://sevalla.com"
                target="_blank"
                rel="noopener noreferrer"
                color={colorMode === 'dark' ? 'brand.300' : 'brand.500'}
                fontWeight="medium"
              >
                Sevalla
              </Link>
            </Flex>
            
            <Text fontSize="xs" color={colorMode === 'dark' ? 'whiteAlpha.600' : 'gray.500'} textAlign="center" maxW="container.md">
              Please note: This platform is intended for appropriate content only. Any content that violates our policies or contains inappropriate material will be removed.
            </Text>
          </VStack>
        </Container>
      </Box>

      <UploadModal isOpen={isUploadOpen} onClose={onUploadClose} onSuccess={refetch} />
      <AuthModal isOpen={isAuthOpen} onClose={onAuthClose} />
    </Box>
  );
}
