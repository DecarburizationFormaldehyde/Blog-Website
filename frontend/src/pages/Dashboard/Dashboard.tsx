import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // 引入路由 Link
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxW="6xl" py={8}>
      <VStack align="stretch" gap={6}>
        <Box>

          <Heading size="lg">仪表盘</Heading>
          <Text mt={2} color="fg.muted">
            欢迎回来，{user?.display_name || user?.name}！
          </Text>
        </Box>

        <Button
          colorPalette="brand"
          asChild
          width="fit-content"
        >
          <RouterLink to="/dashboard/new">
            写新文章
          </RouterLink>
        </Button>

        {/* 文章列表占位 */}
        <Box p={6} border="1px solid" borderColor="border.subtle" borderRadius="lg">
          <Text>你的文章列表将在这里显示</Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Dashboard;