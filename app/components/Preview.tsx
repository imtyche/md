'use client'

import { useEffect, useRef, forwardRef, RefObject } from 'react'

interface PreviewProps {
    html: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ html }, ref) => {
    return (
        <div ref={ref} className="preview-pane">
            <article className="markdown-body markdown-dark" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
})

Preview.displayName = 'Preview'

export default Preview