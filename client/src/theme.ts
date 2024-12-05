import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f3e8ff',
      100: '#e9d5ff',
      200: '#d8b4fe',
      300: '#c084fc',
      400: '#a855f7',
      500: '#9333ea',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    dark: {
      50: '#f9fafb',
      100: '#1e1b2c',
      200: '#171523',
      300: '#12101b',
      400: '#0d0b13',
      500: '#08070c',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'dark.200',
        color: 'whiteAlpha.900',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
          },
          transition: 'all 0.2s',
        },
        ghost: {
          color: 'whiteAlpha.900',
          _hover: {
            bg: 'whiteAlpha.200',
            transform: 'translateY(-1px)',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.500',
            color: 'white',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'dark.100',
          borderRadius: 'xl',
          boxShadow: 'dark-lg',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
        },
        overlay: {
          bg: 'blackAlpha.800',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'dark.100',
          borderRadius: 'lg',
          boxShadow: 'lg',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          transition: 'all 0.3s ease',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '2xl',
            borderColor: 'brand.500',
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'dark.300',
            borderRadius: 'lg',
            _hover: {
              bg: 'dark.400',
            },
            _focus: {
              bg: 'dark.400',
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Heading: {
      baseStyle: {
        color: 'whiteAlpha.900',
      },
    },
    Text: {
      baseStyle: {
        color: 'whiteAlpha.800',
      },
    },
  },
});

export default theme;
