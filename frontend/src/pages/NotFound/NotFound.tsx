import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { LuHouse } from 'react-icons/lu'; // Chakra v3 推荐使用 Lucide 图标

const NotFound = () => {
  return (
    <Container maxW="lg" py={20}>
      <VStack gap={8} textAlign="center">
        <Box color="brand.500">
           <LuHouse size="80px" />
        </Box>

        <Heading size="4xl">404</Heading>
        <Heading size="xl">页面未找到</Heading>

        <Text fontSize="lg" color="fg.muted">
          抱歉，您访问的页面不存在或已被移除。
        </Text>

        <Button asChild colorPalette="brand" size="lg">
          <RouterLink to="/">
            返回首页
          </RouterLink>
        </Button>
      </VStack>
    </Container>
  );
};

export default NotFound;