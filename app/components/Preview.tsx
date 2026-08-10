'use client'

import { forwardRef, CSSProperties } from 'react'

interface PreviewProps {
    html: string
    style?: CSSProperties
    className?: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ html, style, className }, ref) => {
    return (
        <div
            ref={ref}
            className={`preview-pane ${className || ''}`}
            style={style}
        >
            <article className="markdown-body markdown-dark" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
})

Preview.displayName = 'Preview'

export default Preview