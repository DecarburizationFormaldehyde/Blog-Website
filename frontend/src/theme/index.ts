import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
  defineSemanticTokens,
  defineRecipe,
} from '@chakra-ui/react';

const tokens = defineTokens({
  colors: {
    brand: {
      50: { value: '#e6f7ff' },
      100: { value: '#bae7ff' },
      200: { value: '#91d5ff' },
      300: { value: '#69c0ff' },
      400: { value: '#40a9ff' },
      500: { value: '#1890ff' },
      600: { value: '#096dd9' },
      700: { value: '#0050b3' },
      800: { value: '#003a8c' },
      900: { value: '#002766' },
    },
    gray: {
      50: { value: '#f7fafc' },
      100: { value: '#edf2f7' },
      200: { value: '#e2e8f0' },
      300: { value: '#cbd5e0' },
      400: { value: '#a0aec0' },
      500: { value: '#718096' },
      600: { value: '#4a5568' },
      700: { value: '#2d3748' },
      800: { value: '#1a202c' },
      900: { value: '#171923' },
    }
  },
  // ... fonts 保持不变
});

const semanticTokens = defineSemanticTokens({
  colors: {
    bg: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
    text: { value: { base: "{colors.gray.800}", _dark: "white" } },
    componentBorder: { value: { base: "{colors.gray.200}", _dark: "{colors.gray.700}" } },
    scrollbarTrack: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
    scrollbarThumb: { value: { base: "{colors.gray.400}", _dark: "{colors.gray.600}" } },
    scrollbarThumbHover: { value: { base: "{colors.gray.500}", _dark: "{colors.gray.500}" } }
  }
});

const recipes = {
  // ... button 保持不变
  card: defineRecipe({
    className: 'card',
    base: {
      bg: 'bg',
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: 'componentBorder', // 使用新名字
    },
  }),
};

const theme = createSystem(
  defaultConfig,
  defineConfig({
    theme: {
      tokens,
      semanticTokens,
      recipes
    },
    globalCss: {
      body: { bg: "bg", color: "text" },
      // 滚动条样式采用最稳妥的平铺写法
      "::-webkit-scrollbar": { width: "8px" },
      "::-webkit-scrollbar-track": { bg: "scrollbarTrack" },
      "::-webkit-scrollbar-thumb": { bg: "scrollbarThumb", borderRadius: "4px" },
      "::-webkit-scrollbar-thumb:hover": { bg: "scrollbarThumbHover" },
    }
  })
);

export default theme;