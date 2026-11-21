import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Button,
    SimpleGrid,
    HStack,
    Input,
    Skeleton,
    createListCollection,
} from '@chakra-ui/react';
import { InputGroup } from "../../components/ui/input-group";
import { Link as RouterLink } from 'react-router-dom';
import PostCard from '../../components/posts/PostCard';
import { usePosts } from '../../hooks/usePosts';
import { LuSearch } from "react-icons/lu";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../../components/ui/select';


const categories = createListCollection({
  items: [
    { label: "所有分类", value: "all" },
    { label: "技术教程", value: "1" },
    { label: "开发日志", value: "2" },
  ],
});

const Home: React.FC = () => {
  const { posts, isLoading, loadPosts } = usePosts();

  useEffect(() => {
    // 加载已发布的文章
    loadPosts({ status: 'published', limit: 6 });
  }, [loadPosts]);

  return (
    <Box>
      {/* Hero 区域 */}
      <Box bg="brand.500" color="white" py={20}>
        <Container maxW="7xl">
          <VStack align="center" textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              分享知识，记录成长
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              一个简洁高效的博客平台，专注于技术分享和个人成长
            </Text>
            <HStack>
              <RouterLink to="/blog">
                <Button size="lg" colorScheme="white" variant="outline">
                  浏览文章
                </Button>
              </RouterLink>
              <RouterLink to="/new">
                <Button size="lg" colorScheme="white">
                  开始写作
                </Button>
              </RouterLink>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* 内容区域 */}
      <Container maxW="7xl" py={12}>
        {/* 搜索和筛选 */}
        <Box mb={10}>
          <HStack gap={4}>
            <InputGroup
                flex="1"
                maxW="400px"
               startElement={<LuSearch style={{ color: 'var(--chakra-colors-gray-400)' }} />}
            >
                <Input
                    placeholder="搜索文章..."
                    variant="outline"
                    css={{
                        borderColor: "gray.300",
                        _hover: {
                            borderColor: "gray.400",
                        },
                        _focus: {
                            borderColor: "brand.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }
                }}
                />
            </InputGroup>
            <SelectRoot width="200px" collection={categories} defaultValue={["all"]}>
                <SelectTrigger>
                <SelectValueText placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                {categories.items.map((cat) => (
                <SelectItem item={cat} key={cat.value}>
                {cat.label}
                </SelectItem>
                ))}
                </SelectContent>
            </SelectRoot>
            <Button colorPalette="brand">搜索</Button>
          </HStack>
        </Box>

        {/* 推荐文章 */}
        <Box mb={10}>
          <Heading size="lg" mb={6}>
            最新文章
          </Heading>

          {isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} height="300px" borderRadius="md" />
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} variant="vertical" />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* 热门标签 */}
        <Box>
          <Heading size="lg" mb={6}>
            热门标签
          </Heading>
          <HStack wrap="wrap">
            {['JavaScript', 'Python', 'React', 'FastAPI', 'TypeScript', 'Docker'].map((tag) => (
              <Button key={tag} variant="outline" size="sm">
                {tag}
              </Button>
            ))}
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;