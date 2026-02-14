# Zustand Stores 架构文档

## 概述

本项目使用 Zustand 进行全局状态管理，替代了之前分散的 Context API 和 useState 方案。

## Store 列表

### 1. user-store.ts
**职责**: 管理用户信息

**状态**:
- `userInfo`: 用户基本信息（姓名、邮箱、头像）
- `isLoading`: 加载状态
- `error`: 错误信息

**Actions**:
- `fetchUser()`: 从服务器获取用户信息
- `setUserInfo(userInfo)`: 手动设置用户信息
- `reset()`: 重置状态

**持久化**: 无（每次从服务器获取）

**使用示例**:
```tsx
import { useUserStore } from '@/stores'

function UserProfile() {
  const { userInfo, fetchUser } = useUserStore()

  useEffect(() => {
    fetchUser()
  }, [])

  return <div>{userInfo.name}</div>
}
```

---

### 2. chat-store.ts
**职责**: 管理聊天历史和 AI 模型配置

**状态**:
- `chats`: 聊天记录列表
- `isLoading`: 加载状态
- `lastFetch`: 上次获取时间（用于缓存）
- `selectedModelId`: 当前选择的 AI 模型
- `useKnowledgeBase`: 是否使用知识库

**Actions**:
- `fetchChats(force?)`: 获取聊天列表（带 5 分钟缓存）
- `deleteChat(chatId)`: 删除聊天记录
- `setSelectedModelId(modelId)`: 设置 AI 模型
- `setUseKnowledgeBase(use)`: 设置知识库开关
- `reset()`: 重置状态

**持久化**: `selectedModelId`, `useKnowledgeBase`

**缓存策略**: 5 分钟 TTL，避免频繁请求

**使用示例**:
```tsx
import { useChatStore } from '@/stores'

function ChatList() {
  const { chats, fetchChats, selectedModelId, setSelectedModelId } = useChatStore()

  useEffect(() => {
    fetchChats() // 自动使用缓存
  }, [])

  return (
    <div>
      <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)}>
        {/* 模型选项 */}
      </select>
      {chats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
    </div>
  )
}
```

---

### 3. folder-store.ts
**职责**: 管理文件夹 CRUD、拖拽和排序

**状态**:
- `folders`: 文件夹列表（含前 5 个书签）
- `isLoading`: 加载状态
- `lastFetch`: 上次获取时间

**Actions**:
- `fetchFolders(force?)`: 获取文件夹列表（带 10 分钟缓存）
- `createFolder(name)`: 创建文件夹
- `deleteFolder(folderId)`: 删除文件夹（乐观更新）
- `updateFolderEmoji(folderId, emoji)`: 更新文件夹图标（乐观更新）
- `reorderFolders(orderedIds)`: 重新排序文件夹（乐观更新）
- `moveBookmarkToFolder(bookmarkId, sourceFolderId, targetFolderId, title)`: 移动书签（乐观更新）
- `removeBookmarkFromFolder(folderId, bookmarkId)`: 从文件夹移除书签
- `reset()`: 重置状态

**持久化**: 无（从服务器获取）

**缓存策略**: 10 分钟 TTL

**乐观更新**: 所有修改操作都先更新本地状态，失败时自动回滚

**使用示例**:
```tsx
import { useFolderStore } from '@/stores'

function FolderList() {
  const { folders, fetchFolders, updateFolderEmoji } = useFolderStore()

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleEmojiChange = async (folderId: string, emoji: string) => {
    const success = await updateFolderEmoji(folderId, emoji)
    if (!success) {
      toast.error('更新失败')
    }
  }

  return (
    <div>
      {folders.map(folder => (
        <div key={folder.id}>
          <span onClick={() => handleEmojiChange(folder.id, '📁')}>
            {folder.emoji}
          </span>
          {folder.name}
        </div>
      ))}
    </div>
  )
}
```

---

### 4. bookmark-store.ts
**职责**: 管理书签列表、筛选和分页

**状态**:
- `bookmarks`: 书签列表
- `filters`: 筛选条件（类型、平台、文件夹）
- `pagination`: 分页信息
- `isLoading`: 初始加载状态
- `isLoadingMore`: 加载更多状态
- `cache`: 智能缓存（最多 10 个筛选条件）

**Actions**:
- `fetchBookmarks(offset?, append?)`: 获取书签列表
- `setFilters(filters)`: 设置筛选条件（自动触发重新获取）
- `resetFilters()`: 重置筛选条件
- `reset()`: 重置状态

**持久化**: `filters`（用户偏好）

**缓存策略**:
- 2 分钟 TTL
- 最多缓存 10 个不同的筛选条件组合
- 超过限制时删除最旧的缓存

**使用示例**:
```tsx
import { useBookmarkStore } from '@/stores'

function BookmarkList() {
  const {
    bookmarks,
    filters,
    pagination,
    isLoading,
    fetchBookmarks,
    setFilters
  } = useBookmarkStore()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const handleFilterChange = (type: string) => {
    setFilters({ type }) // 自动触发重新获取
  }

  const handleLoadMore = () => {
    fetchBookmarks(bookmarks.length, true)
  }

  return (
    <div>
      <select value={filters.type} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="all">全部</option>
        <option value="article">文章</option>
      </select>

      {bookmarks.map(bookmark => <BookmarkCard key={bookmark.id} item={bookmark} />)}

      {pagination.hasMore && (
        <button onClick={handleLoadMore}>加载更多</button>
      )}
    </div>
  )
}
```

---

### 5. ui-store.ts
**职责**: 管理 UI 状态（搜索对话框、视图模式等）

**状态**:
- `searchDialog`: 搜索对话框状态（open, mode）
- `bookmarkViewMode`: 书签视图模式（grid/list）
- `showAllChats`: 是否显示所有聊天记录

**Actions**:
- `openSearchDialog()`: 打开搜索对话框
- `closeSearchDialog()`: 关闭搜索对话框
- `setSearchMode(mode)`: 设置搜索模式
- `setBookmarkViewMode(mode)`: 设置书签视图模式
- `setShowAllChats(show)`: 设置是否显示所有聊天

**持久化**: `bookmarkViewMode`（用户偏好）

**特殊功能**: 自动注册 Cmd+K / Ctrl+K 快捷键打开搜索

**使用示例**:
```tsx
import { useUIStore } from '@/stores'

function SearchButton() {
  const { openSearchDialog } = useUIStore()

  return <button onClick={openSearchDialog}>搜索 (Cmd+K)</button>
}

function BookmarkGrid() {
  const { bookmarkViewMode, setBookmarkViewMode } = useUIStore()

  return (
    <div>
      <button onClick={() => setBookmarkViewMode('grid')}>网格</button>
      <button onClick={() => setBookmarkViewMode('list')}>列表</button>

      {bookmarkViewMode === 'grid' ? <GridView /> : <ListView />}
    </div>
  )
}
```

---

## 最佳实践

### 1. 使用精确的 Selector
避免不必要的重渲染：

```tsx
// ❌ 不好 - 整个 store 变化都会重渲染
const store = useUserStore()

// ✅ 好 - 只在 userInfo 变化时重渲染
const userInfo = useUserStore(state => state.userInfo)
const fetchUser = useUserStore(state => state.fetchUser)
```

### 2. 利用缓存机制
```tsx
// 自动使用缓存，5 分钟内不会重复请求
useEffect(() => {
  fetchChats()
}, [])

// 强制刷新，忽略缓存
useEffect(() => {
  fetchChats(true)
}, [pathname])
```

### 3. 乐观更新的错误处理
```tsx
const handleDelete = async (folderId: string) => {
  const success = await deleteFolder(folderId)
  if (success) {
    toast.success('删除成功')
    router.push('/')
  } else {
    toast.error('删除失败') // 已自动回滚
  }
}
```

### 4. 持久化状态
持久化的状态会自动保存到 localStorage，刷新页面后恢复：
- `chat-store`: AI 模型选择、知识库开关
- `bookmark-store`: 筛选条件
- `ui-store`: 视图模式

### 5. DevTools 调试
所有 stores 都配置了 Redux DevTools：
1. 安装 Redux DevTools 浏览器扩展
2. 打开开发者工具
3. 切换到 Redux 标签
4. 查看所有 store 的状态和 actions

---

## 性能优化

### 缓存策略
- **Chats**: 5 分钟 TTL - 聊天记录变化不频繁
- **Folders**: 10 分钟 TTL - 文件夹结构相对稳定
- **Bookmarks**: 2 分钟 TTL + 智能缓存 - 书签内容变化较频繁

### 乐观更新
以下操作使用乐观更新，提供即时反馈：
- 文件夹 emoji 修改
- 文件夹删除
- 文件夹排序
- 书签移动

### 智能缓存
`bookmark-store` 使用智能缓存策略：
- 缓存最多 10 个不同的筛选条件组合
- 每个缓存独立的 2 分钟 TTL
- 超过限制时删除最旧的缓存

---

## 迁移指南

### 从 Context API 迁移

**之前**:
```tsx
const { open, setOpen } = useSearchDialog()
```

**现在**:
```tsx
const { searchDialog, openSearchDialog, closeSearchDialog } = useUIStore()
const { open } = searchDialog
```

### 从 useState 迁移

**之前**:
```tsx
const [folders, setFolders] = useState([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  fetch('/api/folders')
    .then(res => res.json())
    .then(data => setFolders(data.folders))
    .finally(() => setIsLoading(false))
}, [])
```

**现在**:
```tsx
const { folders, isLoading, fetchFolders } = useFolderStore()

useEffect(() => {
  fetchFolders() // 自动处理加载状态和缓存
}, [])
```

---

## 类型定义

所有类型定义集中在 `stores/types.ts`：
- `UserInfo`
- `ChatItem`
- `FolderItem`
- `BookmarkItem`
- `BookmarkFilters`
- `BookmarkPagination`
- `ViewMode`
- `SearchDialogState`
- `CacheEntry<T>`
- `CacheMap<T>`

---

## 常见问题

### Q: 为什么有些 store 不持久化？
A: 用户信息和文件夹列表等数据应该从服务器获取最新状态，持久化可能导致数据不一致。

### Q: 如何清除缓存？
A: 调用 `fetchXxx(true)` 强制刷新，或调用 `reset()` 重置整个 store。

### Q: 乐观更新失败后会怎样？
A: 自动回滚到之前的状态，用户看到的数据始终保持一致。

### Q: 可以在服务端组件中使用吗？
A: 不可以，Zustand stores 只能在客户端组件中使用（标记 "use client"）。

### Q: 如何避免重渲染？
A: 使用精确的 selector，只订阅需要的状态片段。

---

## 未来优化

- [ ] 添加单元测试
- [ ] 实现更细粒度的缓存失效策略
- [ ] 添加离线支持
- [ ] 实现跨标签页状态同步
- [ ] 添加状态持久化加密
