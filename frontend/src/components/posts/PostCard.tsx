import React from 'react';
import {
    Box,
    Card,
    Heading,
    Text,
    Image,
    Badge,
    HStack,
    VStack,
    Flex,
    Avatar,
    Tag,

} from "@chakra-ui/react";
import {Link as RouterLink} from 'react-router-dom';
import {type PostSimple} from "../../types";
import {formatDate,calculateReadingTime} from "../../utils";

interface PostCardProps {
    post: PostSimple;
    variant?:'horizontal' | 'vertical';
}

const PostCard: React.FC<PostCardProps> = ({post, variant='vertical'}) => {
    const readingTime = calculateReadingTime(post.content || '');

    if (variant === 'horizontal'){
        return (
            <Card.Root 
                as={RouterLink}
                _hover={{transform: 'translateY(-2px)'}}
                asChild
            >
                <RouterLink to={`/posts/${post.slug}`}>
                <Card.Body>
                    <Flex direction={{base:'column',md:'row'}} gap={4}>
                        {post.featured_image && (
                            <Box flexShrink={0} width={{base:'100%',md:'200px'}} >
                                <Image
                                    src ={post.featured_image}
                                    alt = {post.title}
                                    borderRadius="md"
                                    objectFit="cover"
                                    width="100%"
                                    height="150px"
                                />
                            </Box>
                        )}
                        <VStack align="start" flex={1}>
                            <HStack >
                                {post.status === 'published' ? (
                                    <Badge colorScheme="green">已发布</Badge>
                                ):(
                                    <Badge colorScheme="yellow">草稿</Badge>
                                    )}
                                {post.pinned && <Badge colorScheme="red">置顶</Badge>}
                            </HStack>

                            <Heading size="md">{post.title}</Heading>

                            {post.excerpt &&(
                                <Text color="gray.600" lineClamp={2}>
                                    {post.excerpt}
                                </Text>
                            )}
                            <Flex justify="space-between" width="100%" fontSize="sm" color="gray.500">
                                <HStack>
                                    {post.author && (
                                        <>
                                            <Avatar.Root>
                                                <Avatar.Fallback name={post.author.display_name}/>
                                                <Avatar.Image src={post.author.avatar}/>
                                            </Avatar.Root>
                                            <Text>{post.author.display_name || post.author.username}</Text>
                                        </>
                                    )}
                                    <Text>•</Text>
                                    <Text>{formatDate(post.created_at)}</Text>
                                    <Text>•</Text>
                                    <Text>{readingTime}分钟阅读</Text>
                                </HStack>
                                {post.category &&(
                                    <Tag.Root size="sm" colorPalette="blue">
                                        <Tag.Label>{post.category.name}</Tag.Label>
                                    </Tag.Root>
                                )}
                            </Flex>
                        </VStack>
                    </Flex>
                </Card.Body>
                </RouterLink>
            </Card.Root>
        );
    }


    // 垂直布局
    return (
        <Card.Root
            as={RouterLink}
            height="100%"
            _hover={{transform: 'translateY(-2px)'}}
            asChild
        >
            <RouterLink to={`/posts/${post.slug}`}>
            {post.featured_image && (
                <Image
                    src={post.featured_image}
                    alt={post.title}
                    height="200px"
                    objectFit="cover"
                    borderTopRadius="md"
                />
            )}
            <Card.Body>
                <VStack align="start">
                    <HStack>
                        {post.status === 'published'?(
                            <Badge colorScheme="green">已发布</Badge>
                        ):(
                            <Badge colorScheme="yellow">草稿</Badge>
                        )}
                        {post.pinned && <Badge colorScheme="red">置顶</Badge>}
                    </HStack>
                    <Heading size="md">{post.title}</Heading>

                    {post.excerpt && (
                        <Text color="gray.600" lineClamp={2}>
                            {post.excerpt}
                        </Text>
                    )}

                    <Flex justify="space-between" width="100%" fontSize="sm" color="gray.500">
                        <HStack>
                            {post.author && (
                                <>
                                    <Avatar.Root size="xs">
                                        <Avatar.Fallback name={post.author.display_name}/>
                                        <Avatar.Image src={post.author.avatar}/>
                                    </Avatar.Root>
                                    <Text>{post.author.display_name || post.author.username}</Text>
                                </>
                            )}
                            <Text>•</Text>
                            <Text>{formatDate(post.created_at)}</Text>
                        </HStack>
                        <Text>{readingTime}分钟</Text>
                    </Flex>
                    {post.category && (
                        <Tag.Root size="sm" colorPalette="blue">
                            <Tag.Label>{post.category.name}</Tag.Label>
                        </Tag.Root>
                    )}
                </VStack>
            </Card.Body>
            </RouterLink>
        </Card.Root>
    );
};

export default PostCard;