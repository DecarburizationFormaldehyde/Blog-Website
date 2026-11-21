import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Table,
  IconButton
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // 引入路由 Link
import { useAuth } from '../../hooks/useAuth';
import {useAppSelector, useAppDispatch} from "../../store/hooks.ts";
import {useEffect, useState} from "react";
import {deletePost, fetchPosts} from "../../store/slices/postSlice.ts";
import {toaster} from "../../components/ui/toaster.tsx";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter, DialogActionTrigger
} from "../../components/ui/dialog.tsx"
import {LuEye, LuFilePenLine, LuTrash2} from "react-icons/lu";

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const {posts,isLoading} = useAppSelector(state=>state.posts);
  const [postToDelete,setPostToDelete] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchPosts({author_id: user.id, limit:100}));
    }
  }, [dispatch, user]);

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      // 删除文章逻辑
      await dispatch(deletePost(postToDelete)).unwrap;
      toaster.create({title:'删除成功',type:'success',duration:3000});
      if(user){
        dispatch(fetchPosts({author_id: user.id, limit:100}))
      }
    }catch ( err:any){
      toaster.create({title:'删除失败',type:'error',description:err.message});
    }finally {
      onClose();
      setPostToDelete(null);
    }
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between">
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
        </HStack>

        {isLoading ? (
            <Text>加载中...</Text>
        ):posts.length === 0 ? (
            <Box p={10} textAlign="center" borderWidth={1} borderRadius={"lg"}>
              <Text fontSize="lg" mb={4}>你还没有发布任何文章</Text>
              <Button  colorPalette="brand">
                <RouterLink to="/dashboard/new">
                  ✍️ 开始写作
                </RouterLink>
              </Button>
            </Box>
        ): (
            <Box borderWidth={1} borderRadius={"lg"} overflowY="hidden">
              <Table.Root variant="line" interactive>
                <Table.Header bg="bg.subtle">
                  <Table.Row>
                    <Table.ColumnHeader>标题</Table.ColumnHeader>
                    <Table.ColumnHeader>状态</Table.ColumnHeader>
                    <Table.ColumnHeader>创建时间</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">操作</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {posts.map((post) => (
                      <Table.Row key={post.id}>
                        <Table.Cell>
                          <Text fontWeight="medium">{post.title}</Text>
                          {post.excerpt &&(
                              <Text fontSize="sm" color="fg.muted" lineClamp={1}>
                                {post.excerpt}
                              </Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="fg.muted">{(post.status === 'published' ? '已发布' : '草稿')}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="fg.muted">{post.created_at}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap={2} justify="flex-end">
                          <IconButton
                              asChild
                              aria-label="查看"
                              size="sm"
                              variant="ghost"
                          >
                            <RouterLink to={`/post/${post.slug}`}>
                              <LuEye/>
                            </RouterLink>
                          </IconButton>

                          <IconButton
                              asChild
                              aria-label="编辑"
                              size="sm"
                              variant="ghost"
                          >
                            <RouterLink to={`/dashboard/edit/${post.id}`}>
                              <LuFilePenLine/>
                            </RouterLink>
                          </IconButton>
                            <IconButton
                                aria-label="删除"
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDeleteClick(post.id)}
                            >
                              <LuTrash2 />
                            </IconButton>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
        )}
      </VStack>
      {/* 删除确认对话框 */}
      <DialogRoot open={open}  onOpenChange={(e)=> !e.open && onClose()}>
        <DialogContent
            bg="white"             // 强制底色为白色
            color="gray.800"      // 确保文字颜色在白底下清晰
            borderRadius="l3"     // 保持圆角风格
            boxShadow="lg"        // 增加阴影增强悬浮感
        >
          <DialogHeader>
            <DialogTitle>删除文章</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>确定要删除此文章吗？此操作不可撤销!</Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={onClose}>取消</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={handleDeleteConfirm}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default Dashboard;