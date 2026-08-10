'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { HistoryItem } from '../types'

const HISTORY_KEY = 'pd_history_docs'

export function useHistory() {
    const [historyList, setHistoryList] = useState<HistoryItem[]>([])
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const getHistoryList = useCallback((): HistoryItem[] => {
        if (typeof window === 'undefined') return []
        const raw = localStorage.getItem(HISTORY_KEY)
        if (!raw) return []
        try {
            return JSON.parse(raw)
        } catch {
            return []
        }
    }, [])

    // 初始化加载
    useEffect(() => {
        setHistoryList(getHistoryList())
    }, [getHistoryList])

    const saveHistoryList = useCallback((list: HistoryItem[]) => {
        setHistoryList(list)
        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
        }
    }, [])

    const addToHistory = useCallback((docContent: string, docTitle: string, sourceId: string | null = null) => {
        if (!docContent || !docContent.trim()) return null

        // 清除之前的保存定时器
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        const contentPreview = docContent.substring(0, 200)
        const timeStamp = Date.now()
        const id = sourceId || `doc_${timeStamp}`
        const docName = docTitle.trim() || `文档 ${new Date().toLocaleString()}`

        // 使用 setTimeout 来批量处理更新
        return new Promise<string | null>((resolve) => {
            saveTimeoutRef.current = setTimeout(() => {
                setHistoryList(prev => {
                    let list = prev.map(item => ({ ...item }))
                    const existingIndex = sourceId ? list.findIndex(item => item.id === sourceId) : -1

                    let finalId = id
                    if (existingIndex !== -1) {
                        const existingItem = list[existingIndex]
                        // 检查内容是否真的变化了
                        if (existingItem.content === docContent && existingItem.name === docName) {
                            // 内容没变，不更新
                            resolve(existingItem.id)
                            return prev
                        }
                        existingItem.timestamp = timeStamp
                        existingItem.content = docContent
                        existingItem.name = docName
                        existingItem.preview = contentPreview

                        list.splice(existingIndex, 1)
                        list.unshift(existingItem)
                        finalId = existingItem.id
                    } else {
                        // 检查是否已经存在相同内容的记录（防止重复）
                        const duplicateIndex = list.findIndex(item => item.content === docContent)
                        if (duplicateIndex !== -1) {
                            // 如果找到相同内容的记录，更新它而不是新建
                            const existingItem = list[duplicateIndex]
                            existingItem.timestamp = timeStamp
                            existingItem.name = docName
                            existingItem.preview = contentPreview
                            list.splice(duplicateIndex, 1)
                            list.unshift(existingItem)
                            resolve(existingItem.id)
                            return list
                        }

                        const newRecord: HistoryItem = {
                            id,
                            name: docName,
                            content: docContent,
                            preview: contentPreview,
                            timestamp: timeStamp
                        }
                        list.unshift(newRecord)
                        if (list.length > 50) list.pop()
                    }

                    if (typeof window !== 'undefined') {
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
                    }
                    resolve(finalId)
                    return list
                })
            }, 100)
        })
    }, [])

    const deleteHistoryItem = useCallback((id: string) => {
        setHistoryList(prev => {
            const newList = prev.filter(item => item.id !== id)
            if (typeof window !== 'undefined') {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newList))
            }
            return newList
        })
    }, [])

    const clearAllHistory = useCallback(() => {
        setHistoryList([])
        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
        }
    }, [])

    return {
        historyList,
        addToHistory,
        deleteHistoryItem,
        clearAllHistory
    }
}