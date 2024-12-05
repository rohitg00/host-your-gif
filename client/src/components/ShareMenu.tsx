import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  useClipboard,
} from '@chakra-ui/react';
import { FiShare2, FiLink, FiCode, FiFileText } from 'react-icons/fi';

interface ShareMenuProps {
  gif: {
    title: string;
    shareUrl: string;
  };
}

export function ShareMenu({ gif }: ShareMenuProps) {
  const toast = useToast();
  
  const directLink = gif.shareUrl;
  const embedHtml = `<img src="${gif.shareUrl}" alt="${gif.title}" />`;
  const markdownLink = `![${gif.title}](${gif.shareUrl})`;
  
  const { onCopy: copyDirectLink } = useClipboard(directLink);
  const { onCopy: copyEmbedCode } = useClipboard(embedHtml);
  const { onCopy: copyMarkdown } = useClipboard(markdownLink);

  const handleCopy = (format: string, copyFn: () => void) => {
    copyFn();
    toast({
      title: `${format} copied!`,
      status: 'success',
      duration: 2000,
      position: 'bottom-right',
      variant: 'subtle',
    });
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Share options"
        icon={<FiShare2 />}
        size="sm"
        variant="solid"
        bg="blackAlpha.600"
        _hover={{ bg: 'blackAlpha.800' }}
      />
      <MenuList bg="dark.100" borderColor="whiteAlpha.200">
        <MenuItem
          icon={<FiLink />}
          onClick={() => handleCopy('Direct link', copyDirectLink)}
          _hover={{ bg: 'whiteAlpha.100' }}
        >
          Copy direct link
        </MenuItem>
        <MenuItem
          icon={<FiCode />}
          onClick={() => handleCopy('Embed code', copyEmbedCode)}
          _hover={{ bg: 'whiteAlpha.100' }}
        >
          Copy embed code
        </MenuItem>
        <MenuItem
          icon={<FiFileText />}
          onClick={() => handleCopy('Markdown', copyMarkdown)}
          _hover={{ bg: 'whiteAlpha.100' }}
        >
          Copy markdown
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
