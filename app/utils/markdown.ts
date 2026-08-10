import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.use({
    extensions: [
        {
            name: 'code',
            renderer(token: any) {
                const lang = token.lang || 'plaintext'
                const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext'
                const highlighted = hljs.highlight(token.text, { language: validLanguage }).value
                return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`
            }
        }
    ],
    async: false,
    breaks: true,
    gfm: true
})

export function parseMarkdown(content: string): string {
    return marked.parse(content) as string
}

export function generateDefaultTitle(content: string): string {
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').replace(/^-\s+|^[0-9]+\.\s+/, '').trim()
    if (firstLine.length > 0 && firstLine.length < 40) return firstLine
    return `笔记_${new Date().toLocaleDateString()}`
}