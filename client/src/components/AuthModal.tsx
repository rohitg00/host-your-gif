import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Text,
  Link,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
        });
      } else {
        await register(email, password, name);
        toast({
          title: 'Registration successful',
          description: 'Please log in with your new account',
          status: 'success',
          duration: 3000,
        });
        setIsLogin(true);
      }
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isLogin ? 'Login' : 'Register'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {!isLogin && (
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={loading}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
              <Text>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Link
                  color="blue.500"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Register' : 'Login'}
                </Link>
              </Text>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
