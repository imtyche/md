'use client'

import { ChangeEvent } from 'react'
import HistoryList from './HistoryList'
import { HistoryItem } from '../types'

interface SidebarProps {
    onNewFile: () => void
    onImportFile: (e: ChangeEvent<HTMLInputElement>) => void
    onExportMD: () => void
    onExportHTML: () => void
    onExportWord: () => void
    onTogglePreview: () => void
    isPreviewOnly: boolean
    linkInput: string
    onLinkInputChange: (value: string) => void
    onImportFromLink: () => void
    historyList: HistoryItem[]
    currentDocId: string | null
    onOpenHistory: (id: string) => void
    onDeleteHistory: (id: string) => void
    onClearHistory: () => void
    wordCount: number
}

export default function Sidebar({
                                    onNewFile,
                                    onImportFile,
                                    onExportMD,
                                    onExportHTML,
                                    onExportWord,
                                    onTogglePreview,
                                    isPreviewOnly,
                                    linkInput,
                                    onLinkInputChange,
                                    onImportFromLink,
                                    historyList,
                                    currentDocId,
                                    onOpenHistory,
                                    onDeleteHistory,
                                    onClearHistory,
                                    wordCount
                                }: SidebarProps) {
    return (
        <aside>
            <div className="brand"><i className="fas fa-feather"></i><span>PD Pro</span></div>

            <button className="nav-btn" onClick={onNewFile}>
                <i className="fas fa-file-circle-plus"></i><span>新建文件</span>
            </button>
            <button className="nav-btn" onClick={() => document.getElementById('fileInput')?.click()}>
                <i className="fas fa-upload"></i><span>导入 .md 文件</span>
            </button>
            <button className="nav-btn" onClick={onExportMD}>
                <i className="fas fa-file-code"></i><span>导出 .md</span>
            </button>
            <button className="nav-btn" onClick={onExportHTML}>
                <i className="fas fa-code"></i><span>导出 .html</span>
            </button>
            <button className="nav-btn" onClick={onExportWord}>
                <i className="fas fa-file-word"></i><span>导出 Word</span>
            </button>
            <button className="nav-btn" onClick={onTogglePreview}>
                <i className="fas fa-eye"></i><span>全屏预览</span>
            </button>

            <div className="import-link-area">
                <input
                    type="text"
                    className="link-input"
                    placeholder="粘贴 .md 文件链接"
                    spellCheck={false}
                    value={linkInput}
                    onChange={(e) => onLinkInputChange(e.target.value)}
                />
                <button className="import-link-btn" onClick={onImportFromLink}>
                    <i className="fas fa-link"></i> 打开
                </button>
            </div>

            <HistoryList
                historyList={historyList}
                currentDocId={currentDocId}
                onOpen={onOpenHistory}
                onDelete={onDeleteHistory}
                onClearAll={onClearHistory}
            />

            <input
                type="file"
                id="fileInput"
                accept=".md, .txt, .markdown"
                style={{ display: 'none' }}
                onChange={onImportFile}
            />

            <div className="footer-meta">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>字数: {wordCount}</span>
                    <a style={{ color: 'gainsboro', textDecoration: 'none' }} href="https://github.com/Tyche129/pd" target="_blank" rel="noopener noreferrer">Github</a>
                </div>
            </div>
        </aside>
    )
}