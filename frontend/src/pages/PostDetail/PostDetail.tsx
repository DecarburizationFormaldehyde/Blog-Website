import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Tag,
  IconButton,
  Breadcrumb,
  Skeleton,
} from '@chakra-ui/react';

import { LuChevronRight,LuFilePenLine,LuFileX } from "react-icons/lu";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils';
import {toaster} from "../../components/ui/toaster.tsx";

const PostDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { currentPost,isLoading,loadPost }=usePosts()
    const { user } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if(slug){
            loadPost(slug);
        }
    }, [slug,loadPost]);

    if(isLoading){
        return(
            <Container maxW="4xl" py={8}>
                <VStack align="center" gap={4}>
                    <Skeleton height="40px" width="80%"/>
                    <Skeleton height="20px" width="60%"/>
                    <Skeleton height="400px" width="100%"/>
                </VStack>
            </Container>
        );
    }

    if(!currentPost){
        return (
            <Container maxW="4xl" py={8}>
                <Heading>文章不存在</Heading>
                <Text mt={4}>抱歉，您访问的文章不存在或已被删除。</Text>
            </Container>
        )
    }

    const isAuthor =user?.id === currentPost.author_id || user?.is_admin;

    return (
        <Container maxW="4xl" py={8}>
            {/* 面包屑导航 */}
            <Breadcrumb.Root gap="8px" mb={6}>
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/">首页</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <LuChevronRight color="gray.500" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/blog">文章</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <LuChevronRight color="gray.500" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink>{currentPost.title}</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <Box mb={8}>
                <HStack gap={2} mb={4}>
                    <Badge colorScheme={currentPost.status === 'published'?'green':'yellow'}>
                        {currentPost.status === 'published'?'已发布':'草稿'}
                    </Badge>
                    {currentPost.pinned && <Badge colorScheme="red">置顶</Badge>}
                    {isAuthor && (
                        <HStack gap={2} ml="auto">
                            <IconButton
                            aria-label="编辑"
                            size="sm"
                            onClick={() => navigate(`/dashboard/edit/${currentPost.id}`)}
                            >
                                <LuFilePenLine />
                            </IconButton>
                            <IconButton
                            aira-label="删除"
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                                // TODO: 删除文章
                                toaster.create({
                                    title: '功能开发中',
                                    type: 'info',
                                    duration:404,
                                });
                            }}
                            >
                                <LuFileX />
                            </IconButton>
                        </HStack>
                    )}
                </HStack>
                <Heading size="2xl"  mb={4}>
                    {currentPost.title}
                </Heading>

                <HStack gap={4} color="gray.600" fontSize="sm" mb={6}>
                    {currentPost.author && (
                        <HStack gap={2}>
                            <Avatar.Root size="sm">
                                <Avatar.Image src={currentPost.author.avatar}/>
                                <Avatar.Fallback>{currentPost.author.display_name || currentPost.author.username}</Avatar.Fallback>
                            </Avatar.Root>
                             <Text>{currentPost.author.display_name || currentPost.author.username}</Text>
                        </HStack>
                    )}
                    <Text>•</Text>
                    <Text>{formatDateTime(currentPost.created_at)}</Text>
                    {currentPost.reading_time && (
                        <>
                            <Text>•</Text>
                            <Text>{currentPost.reading_time}分钟阅读</Text>
                        </>
                    )}
                </HStack>
                {currentPost.excerpt && (
                    <Text fontSize="lg" mb={6} color="gray.600" fontStyle="italic">
                         {currentPost.excerpt}
                    </Text>
                )}

                {currentPost.category && (
                    <HStack gap={2} mb={6}>
                        <Tag.Root size="lg" colorPalette="blue">
                             <Tag.Label>{currentPost.category.name}</Tag.Label>
                        </Tag.Root>
                        {currentPost.tags?.map((tag) => (
                            <Tag.Root key={tag.id} size="md">
                                <Tag.Label>{tag.name}</Tag.Label>
                            </Tag.Root>
                        ))}
                    </HStack>
                )}
            </Box>
            {/* 文章内容 */}
            <Box mb={8}>
                {currentPost.featured_image && (
                    <Box
                        borderRadius="lg"
                        overflow="hidden"
                        mb={8}
                        boxShadow="xl"
                    >
                        <img
                            src={currentPost.featured_image}
                            alt={currentPost.title}
                            style={{ width: "100%" ,maxHeight :`400px`,objectFit:'cover'}}
                        />
                    </Box>
                )}
                <Box className="markdown-content" fontSize="lg" lineHeight="1.8">
                    <ReactMarkdown
                        components={{
                        code(props) {
                          // 1. 解构出不需要传给 DOM 的属性，防止 React 报错
                          const { children, className, node,ref, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || '');

                          // 2. 如果匹配到语言标识，渲染代码块高亮
                          return match ? (
                            <SyntaxHighlighter
                              {...rest}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            // 3. 行内代码：使用 Chakra v3 的原生样式增强
                            <code
                              className={className}
                              style={{
                                background: "color-mix(in srgb, var(--chakra-colors-gray-200), transparent 50%)",
                                padding: "0.2em 0.4em",
                                borderRadius: "4px",
                                fontSize: "0.9em",
                                fontFamily: "var(--chakra-fonts-mono)"
                              }}
                              {...rest}
                            >
                              {children}
                            </code>
                          );
                        },
                        // 额外赠送：适配 Chakra v3 的图片渲染，防止图片溢出
                        img({ node, ...props }) {
                          return (
                            <img
                              {...props}
                              style={{
                                maxWidth: '100%',
                                borderRadius: 'var(--chakra-radii-md)',
                                margin: '1.5rem 0'
                              }}
                            />
                          );
                        }
                        }}
                        >
                        {currentPost.content}
                        </ReactMarkdown>
                </Box>
            </Box>
            {/* 文章元信息 */}
            <Box fontSize="sm" color="gray.600">
            <HStack justify="space-between">
              <Text>字数: {currentPost.word_count}</Text>
              <Text>更新于: {currentPost.updated_at ? formatDateTime(currentPost.updated_at) : '暂无更新'}</Text>
            </HStack>
            </Box>

        </Container>
    );

};

export default PostDetail;