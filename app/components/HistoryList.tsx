'use client'

import { HistoryItem } from '../types'

interface HistoryListProps {
    historyList: HistoryItem[]
    currentDocId: string | null
    onOpen: (id: string) => void
    onDelete: (id: string) => void
    onClearAll: () => void
}

export default function HistoryList({
                                        historyList,
                                        currentDocId,
                                        onOpen,
                                        onDelete,
                                        onClearAll
                                    }: HistoryListProps) {
    return (
        <div className="history-section">
            <div className="history-title">
                <span><i className="far fa-clock"></i> 历史文档</span>
                {historyList.length > 0 && (
                    <button className="clear-history-btn" onClick={onClearAll}>清空</button>
                )}
            </div>
            <div className="history-list">
                {historyList.length === 0 ? (
                    <div className="empty-history">暂无历史记录</div>
                ) : (
                    historyList.map((item) => (
                        <div
                            key={item.id}
                            className={`history-item ${currentDocId === item.id ? 'active' : ''}`}
                        >
                            <div className="history-info" onClick={() => onOpen(item.id)}>
                                <div className="history-name" title={item.name}>
                                    📄 {item.name.length > 24 ? item.name.slice(0, 24) + '...' : item.name}
                                </div>
                                <div className="history-meta">
                                    <span><i className="far fa-calendar-alt"></i> {new Date(item.timestamp).toLocaleDateString()}</span>
                                    <span>{item.content.length} 字</span>
                                </div>
                            </div>
                            <div className="history-actions">
                                <button
                                    className="history-del"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(item.id)
                                    }}
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}