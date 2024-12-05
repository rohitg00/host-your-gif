import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Image,
  SimpleGrid,
  Progress,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('gif', file);
      });
      formData.append('isPublic', String(isPublic));

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifs'] });
      toast({
        title: 'Upload successful',
        status: 'success',
        duration: 3000,
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      toast({
        title: 'Too many files',
        description: 'You can only upload up to 10 files at once',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.type !== 'image/gif') {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a GIF file`,
          status: 'error',
          duration: 3000,
        });
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 50MB limit`,
          status: 'error',
          duration: 3000,
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    setPreviews([]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload GIFs',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    uploadMutation.mutate(selectedFiles);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload GIFs</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Button
              onClick={() => fileInputRef.current?.click()}
              colorScheme="blue"
              width="100%"
            >
              Select GIFs
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/gif"
              multiple
              style={{ display: 'none' }}
            />
            
            {selectedFiles.length > 0 && (
              <>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Make {selectedFiles.length > 1 ? 'these GIFs' : 'this GIF'} public
                  </FormLabel>
                  <Switch
                    isChecked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                </FormControl>

                <Text>
                  Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                </Text>

                <SimpleGrid columns={3} spacing={2} width="100%">
                  {previews.map((preview, index) => (
                    <Image
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      borderRadius="md"
                    />
                  ))}
                </SimpleGrid>

                {uploadProgress > 0 && (
                  <Progress
                    value={uploadProgress}
                    width="100%"
                    borderRadius="md"
                  />
                )}

                <Button
                  onClick={handleUpload}
                  colorScheme="green"
                  width="100%"
                  isLoading={uploadMutation.isPending}
                >
                  Upload
                </Button>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
