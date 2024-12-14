import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    dark: {
      100: '#1A1B1E',
      200: '#141517',
      300: '#101113'
    },
    brand: {
      400: '#9333EA',
      500: '#7928CA',
      600: '#6B21A8'
    }
  },
  styles: {
    global: (props: Record<string, any>) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.200' : 'gray.50',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'
      }
    })
  },
  components: {
    Card: {
      baseStyle: (props: Record<string, any>) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'dark.100' : 'white',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'
        }
      })
    },
    Button: {
      variants: {
        solid: (props: Record<string, any>) => ({
          bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500'
          }
        }),
        ghost: (props: Record<string, any>) => ({
          _hover: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50'
          }
        })
      }
    },
    Input: {
      variants: {
        outline: (props: Record<string, any>) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'dark.300' : 'white',
            borderColor: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'gray.300'
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#7928CA' : '#9333EA'}`
            }
          }
        })
      }
    }
  }
});

export default theme;
