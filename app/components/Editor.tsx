'use client'

import { useEffect, useRef, forwardRef, RefObject } from 'react'

interface EditorProps {
    content: string
    onChange: (content: string) => void
    onScroll: () => void
    placeholder?: string
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
    ({ content, onChange, onScroll, placeholder }, ref) => {
        return (
            <textarea
                ref={ref}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onScroll={onScroll}
                spellCheck={false}
                placeholder={placeholder || '在此输入 Markdown...'}
            />
        )
    }
)

Editor.displayName = 'Editor'

export default Editor