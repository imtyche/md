'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { saveAs } from 'file-saver'

import { useHistory } from './hooks/useHistory'
import { parseMarkdown, generateDefaultTitle } from './utils/markdown'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'

export default function Home() {
  const [editorContent, setEditorContent] = useState('')
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [currentDocName, setCurrentDocName] = useState('未命名文档')
  const [mdLinkInput, setMdLinkInput] = useState('')
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [saveStatus, setSaveStatus] = useState('就绪')
  const [showPreview, setShowPreview] = useState(true)

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const saveContentRef = useRef<string>('')
  const isInitializedRef = useRef(false)

  const { historyList, addToHistory, deleteHistoryItem, clearAllHistory } = useHistory()

  const wordCount = useMemo(() => editorContent.length, [editorContent])
  const parsedHtml = useMemo(() => parseMarkdown(editorContent), [editorContent])

  // 同步滚动
  const syncScroll = useCallback(() => {
    if (isPreviewOnly || !showPreview || !editorRef.current || !previewRef.current) return

    const editor = editorRef.current
    const preview = previewRef.current

    if (!editor.scrollHeight || editor.clientHeight === 0) return
    const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    const destScrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight)
    preview.scrollTop = isNaN(destScrollTop) ? 0 : destScrollTop
  }, [isPreviewOnly, showPreview])

  // 自动保存至本地
  const triggerRender = useCallback(() => {
    localStorage.setItem('pd_content_dark', editorContent)
    setSaveStatus('自动保存中...')
    setTimeout(() => setSaveStatus('已保存'), 400)
    syncScroll()
  }, [editorContent, syncScroll])

  // 保存到历史记录（防重复）
  const saveToHistory = useCallback(async (content: string, title: string, docId: string | null = null) => {
    // 如果内容和上次保存的内容相同，则不重复保存
    if (saveContentRef.current === content && docId === currentDocId) {
      return
    }
    saveContentRef.current = content

    const savedId = await addToHistory(content, title, docId)
    if (savedId && !docId) {
      setCurrentDocId(savedId)
    }
    return savedId
  }, [addToHistory, currentDocId])

  // 插入文本
  const insertText = useCallback((before: string, after: string) => {
    if (!editorRef.current) return
    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const val = editorContent

    setEditorContent(val.substring(0, start) + before + val.substring(start, end) + after + val.substring(end))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }, [editorContent])

  // 编辑器内容变化
  const handleEditorChange = useCallback((newContent: string) => {
    setEditorContent(newContent)
    triggerRender()

    // 清除之前的定时器
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current)
    }

    // 防抖保存历史记录
    historyDebounceRef.current = setTimeout(async () => {
      if (!newContent || !newContent.trim()) return

      const nextTitle = generateDefaultTitle(newContent)

      if (currentDocId) {
        // 更新已存在的记录
        await saveToHistory(newContent, nextTitle, currentDocId)
        // 更新文档名称
        if (nextTitle !== currentDocName) {
          setCurrentDocName(nextTitle)
        }
      } else {
        // 创建新记录（只在内容足够长时）
        if (newContent.trim().length > 10) {
          const savedId = await saveToHistory(newContent, nextTitle, null)
          if (savedId) {
            setCurrentDocName(nextTitle)
          }
        }
      }
    }, 1000) // 增加防抖时间到 1 秒
  }, [currentDocId, currentDocName, triggerRender, saveToHistory])

  // 新建文件
  const createNewFile = useCallback(() => {
    if (editorContent.trim().length > 0) {
      if (!confirm('新建文件可能会丢失当前未保存的内容，确定继续吗？')) return
    }
    const newContent = '# 崭新的文档 ✨\n\n在这里书写你的灵感...'
    setEditorContent(newContent)
    setCurrentDocId(null)
    setCurrentDocName('未命名文档')
    setSaveStatus('已创建新文件')
    saveContentRef.current = ''

    // 创建新历史记录
    setTimeout(async () => {
      const title = generateDefaultTitle(newContent)
      const savedId = await addToHistory(newContent, title, null)
      if (savedId) {
        setCurrentDocId(savedId)
        setCurrentDocName(title)
        saveContentRef.current = newContent
      }
    }, 100)

    setTimeout(() => editorRef.current?.focus(), 0)
  }, [editorContent, addToHistory])

  // 导入文件
  const importFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const content = ev.target?.result as string
      setEditorContent(content)
      const fileName = file.name.replace(/\.md$|\.markdown$|\.txt$/i, '') || '导入文档'
      setCurrentDocName(fileName)

      const savedId = await addToHistory(content, fileName, null)
      if (savedId) {
        setCurrentDocId(savedId)
        saveContentRef.current = content
      }
      setSaveStatus(`已导入: ${file.name}`)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }, [addToHistory])

  // 从链接导入
  const importFromLink = useCallback(async () => {
    let url = mdLinkInput.trim()
    if (!url) {
      alert('请输入有效的链接地址')
      return
    }
    if (url.includes('github.com') && url.includes('/blob/')) {
      url = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/')
    }
    setSaveStatus('正在加载远程文档...')
    try {
      const response = await fetch(url, { cache: 'no-cache' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()

      setEditorContent(text)
      let fileName = '远程文档'
      const urlParts = url.split('/')
      const lastPart = urlParts.pop() || 'document'
      fileName = lastPart.endsWith('.md') ? lastPart.slice(0, -3) : lastPart.substring(0, 30)

      setCurrentDocName(fileName)

      const savedId = await addToHistory(text, fileName, null)
      if (savedId) {
        setCurrentDocId(savedId)
        saveContentRef.current = text
      }

      setSaveStatus(`已打开链接: ${fileName}`)
      setMdLinkInput('')
      if (isPreviewOnly) setIsPreviewOnly(false)
      setTimeout(() => editorRef.current?.focus(), 0)
    } catch (err: any) {
      alert(`无法加载链接内容: ${err.message}`)
      setSaveStatus('链接加载失败')
    }
  }, [mdLinkInput, isPreviewOnly, addToHistory])

  // 打开历史文档
  const openHistoryDoc = useCallback((id: string) => {
    const item = historyList.find(h => h.id === id)
    if (item) {
      setEditorContent(item.content)
      setCurrentDocId(item.id)
      setCurrentDocName(item.name)
      saveContentRef.current = item.content

      setSaveStatus(`已打开: ${item.name}`)
      if (isPreviewOnly) setIsPreviewOnly(false)
      setTimeout(() => editorRef.current?.focus(), 0)
    }
  }, [historyList, isPreviewOnly])

  // 删除历史
  const handleDeleteHistory = useCallback((id: string) => {
    deleteHistoryItem(id)
    if (currentDocId === id) {
      setCurrentDocId(null)
      setCurrentDocName('未命名文档')
      saveContentRef.current = ''
    }
    setSaveStatus('已删除历史记录')
  }, [currentDocId, deleteHistoryItem])

  // 清空历史
  const handleClearAllHistory = useCallback(() => {
    if (confirm('⚠️ 清空所有历史记录不可恢复，确定要清空吗？')) {
      clearAllHistory()
      setCurrentDocId(null)
      setCurrentDocName('未命名文档')
      saveContentRef.current = ''
      setSaveStatus('历史已清空')
    }
  }, [clearAllHistory])

  // 导出 MD
  const exportMD = useCallback(() => {
    let name = currentDocName
    if (name === '未命名文档' && editorContent.trim()) {
      name = generateDefaultTitle(editorContent)
      setCurrentDocName(name)
    }

    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name !== '未命名文档' ? `${name}.md` : `PD_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [editorContent, currentDocName])

  // 导出 HTML
  const exportHTML = useCallback(() => {
    let name = currentDocName
    if (name === '未命名文档' && editorContent.trim()) {
      name = generateDefaultTitle(editorContent)
      setCurrentDocName(name)
    }

    const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Exported HTML</title></head><body>${parsedHtml}</body></html>`
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = name !== '未命名文档' ? `${name}.html` : `PD_${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(link.href)
  }, [editorContent, currentDocName, parsedHtml])

  // 导出 Word
  const exportWord = useCallback(async () => {
    let name = currentDocName
    if (name === '未命名文档' && editorContent.trim()) {
      name = generateDefaultTitle(editorContent)
      setCurrentDocName(name)
    }

    setSaveStatus('正在生成 Word...')
    const filename = name !== '未命名文档' ? `${name}.docx` : `PD_${Date.now()}.docx`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; }
            table { border-collapse: collapse; width: 100%; }
            table, th, td { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          ${parsedHtml}
        </body>
      </html>
    `

    try {
      const { asBlob: asBlobFn } = await import('html-docx-js-typescript')
      const data = await asBlobFn(htmlContent)
      saveAs(data as Blob, filename)
      setSaveStatus('导出 Word 成功')
    } catch (err: any) {
      setSaveStatus('导出 Word 失败')
      alert(`Word 导出失败: ${err.message}`)
    }
  }, [editorContent, currentDocName, parsedHtml])

  // 切换全屏预览
  const togglePreviewOnly = useCallback(() => {
    setIsPreviewOnly(!isPreviewOnly)
    if (!isPreviewOnly) {
      setShowPreview(true)
    }
  }, [isPreviewOnly])

  // 初始化加载
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const saved = localStorage.getItem('pd_content_dark')
    const initialContent = saved || '# PD Pro\n\n在这里书写你的灵感...'
    setEditorContent(initialContent)

    // 检查是否已有历史记录
    if (historyList.length === 0) {
      // 如果没有历史记录，创建一条
      setTimeout(async () => {
        const title = generateDefaultTitle(initialContent)
        const savedId = await addToHistory(initialContent, title, null)
        if (savedId) {
          setCurrentDocId(savedId)
          setCurrentDocName(title)
          saveContentRef.current = initialContent
        }
      }, 100)
    } else {
      // 如果有历史记录，使用最新的
      const latest = historyList[0]
      if (latest) {
        setCurrentDocId(latest.id)
        setCurrentDocName(latest.name)
        saveContentRef.current = latest.content
        // 如果编辑器内容与最新历史不同，使用历史内容
        if (latest.content !== initialContent) {
          setEditorContent(latest.content)
        }
      }
    }

    setTimeout(syncScroll, 100)
  }, [historyList, addToHistory, syncScroll])

  // 键盘快捷键 - 阻止 Ctrl+S 默认行为
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
      <div className={`app-container ${isPreviewOnly ? 'preview-only' : ''}`} style={{ display: 'flex', height: '100vh' }}>
        {!isPreviewOnly && (
            <Sidebar
                onNewFile={createNewFile}
                onImportFile={importFile}
                onExportMD={exportMD}
                onExportHTML={exportHTML}
                onExportWord={exportWord}
                onTogglePreview={togglePreviewOnly}
                isPreviewOnly={isPreviewOnly}
                linkInput={mdLinkInput}
                onLinkInputChange={setMdLinkInput}
                onImportFromLink={importFromLink}
                historyList={historyList}
                currentDocId={currentDocId}
                onOpenHistory={openHistoryDoc}
                onDeleteHistory={handleDeleteHistory}
                onClearHistory={handleClearAllHistory}
                wordCount={wordCount}
            />
        )}

        <main style={{ flex: 1, padding: isPreviewOnly ? '0' : '16px 20px 20px 20px', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
              className={`workspace-card ${!showPreview ? 'hide-preview' : ''}`}
              style={{
                background: '#111119',
                borderRadius: isPreviewOnly ? '0' : '12px',
                border: isPreviewOnly ? 'none' : '1px solid #24243a',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                minHeight: 0,
              }}
          >
            {!isPreviewOnly && (
                <Toolbar
                    onInsert={insertText}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    saveStatus={saveStatus}
                />
            )}

            <div className="split-view" style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}>
              {!isPreviewOnly && (
                  <Editor
                      ref={editorRef}
                      content={editorContent}
                      onChange={handleEditorChange}
                      onScroll={syncScroll}
                  />
              )}
              <Preview
                  ref={previewRef}
                  html={parsedHtml}
                  className={isPreviewOnly ? 'preview-fullscreen' : ''}
              />
            </div>
          </div>
        </main>

        {isPreviewOnly && (
            <button
                id="exitPreview"
                onClick={() => setIsPreviewOnly(false)}
                style={{
                  position: 'fixed',
                  bottom: '30px',
                  right: '30px',
                  background: '#2d2d42',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 28px',
                  color: '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  zIndex: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#40405a'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2d2d42'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
            >
              <i className="fas fa-edit"></i> 退出预览
            </button>
        )}
      </div>
  )
}