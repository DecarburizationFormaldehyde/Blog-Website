import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LuWrench } from 'react-icons/lu'; // 推荐使用 Lucide 图标
import { ProgressRoot,ProgressBar } from "../../components/ui/progress"; // 这里的 Progress 是 Snippet 封装后的组件

const UnderConstruction = () => {
  const location = useLocation();
  const pathName = location.pathname === '/settings' ? '设置' : '此功能';

  return (
    <Container maxW="lg" py={20}>
      <VStack gap={8} textAlign="center">
        <Box color="orange.400">
          <LuWrench size="80px" />
        </Box>

        <Heading size="lg">{pathName}正在建设中</Heading>

        <Text fontSize="lg" color="fg.muted">
          我们正在努力开发此功能，敬请期待！
        </Text>

        <ProgressRoot size="xs" width="100%" value={null} colorPalette="orange">
          <ProgressBar />
        </ProgressRoot>

        <Button asChild colorPalette="brand" size="lg" mt={4}>
          <RouterLink to="/">
            返回首页
          </RouterLink>
        </Button>
      </VStack>
    </Container>
  );
};

export default UnderConstruction;