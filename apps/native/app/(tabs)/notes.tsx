import { Ionicons } from "@expo/vector-icons"
import { getDocumentAsync } from "expo-document-picker"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ApiError } from "@/lib/api-client"
import { fetchIngestHistory, type IngestHistoryItem, ingestFile, ingestUrl } from "@/lib/ingest-api"

type IngestState = "idle" | "processing" | "success" | "error"

interface SelectedFile {
  uri: string
  name: string
  mimeType: string
  size: number
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<"url" | "file">("url")
  const [url, setUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [state, setState] = useState<IngestState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<IngestHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isProcessing = state === "processing"

  const loadHistory = useCallback(async () => {
    try {
      const result = await fetchIngestHistory(30)
      setHistory(result.items)
    } catch {
      // ignore history load errors
    }
  }, [])

  useEffect(() => {
    loadHistory().finally(() => setIsLoadingHistory(false))
  }, [loadHistory])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadHistory()
    setIsRefreshing(false)
  }

  const resetState = useCallback(() => {
    setState("idle")
    setError(null)
  }, [])

  const handleUrlSubmit = useCallback(async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      return
    }
    setState("processing")
    setError(null)
    try {
      await ingestUrl(trimmed)
      setState("success")
      setUrl("")
      loadHistory()
      setTimeout(resetState, 2000)
    } catch (err) {
      setState("error")
      setError(err instanceof ApiError ? err.message : "导入失败")
    }
  }, [url, loadHistory, resetState])

  const handlePickFile = useCallback(async () => {
    try {
      const result = await getDocumentAsync({
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0]
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
        })
      }
    } catch {
      Alert.alert("选择文件失败", "请重试")
    }
  }, [])

  const handleFileSubmit = useCallback(async () => {
    if (!selectedFile) {
      return
    }
    setState("processing")
    setError(null)
    try {
      await ingestFile(selectedFile.uri, selectedFile.name, selectedFile.mimeType)
      setState("success")
      setSelectedFile(null)
      loadHistory()
      setTimeout(resetState, 2000)
    } catch (err) {
      setState("error")
      setError(err instanceof ApiError ? err.message : "上传失败")
    }
  }, [selectedFile, loadHistory, resetState])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>导入</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isLoadingHistory ? (
            <View style={styles.center}>
              <ActivityIndicator color="#737373" size="small" />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons color="#d4d4d4" name="time-outline" size={40} />
              <Text style={styles.emptyText}>暂无导入记录</Text>
            </View>
          )
        }
        ListHeaderComponent={
          <IngestCard
            activeTab={activeTab}
            error={error}
            handleFileSubmit={handleFileSubmit}
            handlePickFile={handlePickFile}
            handleUrlSubmit={handleUrlSubmit}
            isProcessing={isProcessing}
            onTabChange={setActiveTab}
            selectedFile={selectedFile}
            setUrl={setUrl}
            state={state}
            url={url}
          />
        }
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} />}
        renderItem={({ item }) => <HistoryRow item={item} />}
      />
    </View>
  )
}

function IngestCard({
  activeTab,
  onTabChange,
  isProcessing,
  url,
  setUrl,
  handleUrlSubmit,
  selectedFile,
  handlePickFile,
  handleFileSubmit,
  state,
  error,
}: {
  activeTab: "url" | "file"
  onTabChange: (tab: "url" | "file") => void
  isProcessing: boolean
  url: string
  setUrl: (v: string) => void
  handleUrlSubmit: () => void
  selectedFile: SelectedFile | null
  handlePickFile: () => void
  handleFileSubmit: () => void
  state: IngestState
  error: string | null
}) {
  return (
    <View style={styles.card}>
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => !isProcessing && onTabChange("url")}
          style={[styles.tab, activeTab === "url" && styles.tabActive]}
        >
          <Ionicons
            color={activeTab === "url" ? "#fff" : "#525252"}
            name="link-outline"
            size={16}
          />
          <Text style={[styles.tabText, activeTab === "url" && styles.tabTextActive]}>链接</Text>
        </Pressable>
        <Pressable
          onPress={() => !isProcessing && onTabChange("file")}
          style={[styles.tab, activeTab === "file" && styles.tabActive]}
        >
          <Ionicons
            color={activeTab === "file" ? "#fff" : "#525252"}
            name="document-outline"
            size={16}
          />
          <Text style={[styles.tabText, activeTab === "file" && styles.tabTextActive]}>文件</Text>
        </Pressable>
      </View>

      {activeTab === "url" ? (
        <View style={styles.tabContent}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isProcessing}
            keyboardType="url"
            onChangeText={setUrl}
            onSubmitEditing={handleUrlSubmit}
            placeholder="粘贴链接 https://..."
            placeholderTextColor="#a3a3a3"
            returnKeyType="go"
            style={styles.urlInput}
            value={url}
          />
          <Pressable
            disabled={!url.trim() || isProcessing}
            onPress={handleUrlSubmit}
            style={[
              styles.submitButton,
              (!url.trim() || isProcessing) && styles.submitButtonDisabled,
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>导入链接</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.tabContent}>
          <Pressable disabled={isProcessing} onPress={handlePickFile} style={styles.filePicker}>
            {selectedFile ? (
              <>
                <Ionicons color="#262626" name="document-attach-outline" size={28} />
                <Text numberOfLines={1} style={styles.fileName}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </>
            ) : (
              <>
                <Ionicons color="#a3a3a3" name="cloud-upload-outline" size={32} />
                <Text style={styles.filePickerText}>点击选择文件</Text>
                <Text style={styles.filePickerHint}>支持 Word、Excel、图片、音频等</Text>
              </>
            )}
          </Pressable>
          <Pressable
            disabled={!selectedFile || isProcessing}
            onPress={handleFileSubmit}
            style={[
              styles.submitButton,
              (!selectedFile || isProcessing) && styles.submitButtonDisabled,
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>上传并导入</Text>
            )}
          </Pressable>
        </View>
      )}

      <StatusFeedback error={error} state={state} />
    </View>
  )
}

function StatusFeedback({ state, error }: { state: IngestState; error: string | null }) {
  if (state === "success") {
    return (
      <View style={styles.statusRow}>
        <Ionicons color="#22c55e" name="checkmark-circle" size={16} />
        <Text style={[styles.statusText, { color: "#22c55e" }]}>导入成功</Text>
      </View>
    )
  }
  if (state === "error" && error) {
    return (
      <View style={styles.statusRow}>
        <Ionicons color="#ef4444" name="close-circle" size={16} />
        <Text style={[styles.statusText, { color: "#ef4444" }]}>{error}</Text>
      </View>
    )
  }
  return null
}

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return { label: "已完成", bg: "#dcfce7", color: "#16a34a" }
    case "failed":
      return { label: "失败", bg: "#fee2e2", color: "#dc2626" }
    default:
      return { label: "处理中", bg: "#fef3c7", color: "#d97706" }
  }
}

function HistoryRow({ item }: { item: IngestHistoryItem }) {
  const statusConfig = getStatusConfig(item.ingestStatus)
  const date = new Date(item.createdAt).toLocaleDateString("zh-CN")

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyContent}>
        <Text numberOfLines={1} style={styles.historyTitle}>
          {item.title || item.url || "未命名"}
        </Text>
        <View style={styles.historyMeta}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          {item.platform && <Text style={styles.historyMetaText}>{item.platform}</Text>}
          <Text style={styles.historyMetaText}>{date}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#262626",
  },
  center: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#a3a3a3",
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  tabActive: {
    backgroundColor: "#262626",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#525252",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabContent: {
    gap: 12,
  },
  urlInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#262626",
    backgroundColor: "#fafafa",
  },
  filePicker: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 24,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    maxWidth: "80%",
  },
  fileSize: {
    fontSize: 12,
    color: "#a3a3a3",
  },
  filePickerText: {
    fontSize: 14,
    color: "#737373",
  },
  filePickerHint: {
    fontSize: 12,
    color: "#a3a3a3",
  },
  submitButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#262626",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  historyContent: {
    flex: 1,
    gap: 6,
  },
  historyTitle: {
    fontSize: 15,
    color: "#262626",
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  historyMetaText: {
    fontSize: 12,
    color: "#a3a3a3",
  },
})
