'use client'

interface ToolbarProps {
    onInsert: (before: string, after: string) => void
    showPreview: boolean
    onTogglePreview: () => void
    saveStatus: string
}

export default function Toolbar({ onInsert, showPreview, onTogglePreview, saveStatus }: ToolbarProps) {
    const tools = [
        { icon: 'fa-heading', before: '### ', after: '', title: '标题' },
        { icon: 'fa-bold', before: '**', after: '**', title: '粗体' },
        { icon: 'fa-italic', before: '*', after: '*', title: '斜体' },
        { icon: 'fa-align-center', before: '<center>', after: '</center>', title: '居中' },
        { icon: 'fa-code', before: '```\n', after: '\n```', title: '代码块' },
        { icon: 'fa-link', before: '[', after: '](https://)', title: '链接' },
        { icon: 'fa-quote-left', before: '> ', after: '', title: '引用' },
        { icon: 'fa-list-ul', before: '* ', after: '', title: '无序列表' },
        { icon: 'fa-list-ol', before: '1. ', after: '', title: '有序列表' },
        { icon: 'fa-tasks', before: '- [ ] ', after: '', title: '任务列表' },
        { icon: 'fa-image', before: '![alt](', after: ')', title: '图片' },
        { icon: 'fa-terminal', before: '`', after: '`', title: '行内代码' },
        { icon: 'fa-minus', before: '\n---\n', after: '', title: '分割线' },
        { icon: 'fa-table', before: '| 表头1 | 表头2 |\n| --- | --- |\n| 单元格 | 单元格 |\n', after: '', title: '表格' },
        { icon: 'fa-superscript', before: '^', after: '^', title: '上标' },
        { icon: 'fa-subscript', before: '~', after: '~', title: '下标' },
        { icon: 'fa-highlighter', before: '==', after: '==', title: '高亮' },
        { icon: 'fa-underline', before: '<u>', after: '</u>', title: '下划线' },
        { icon: 'fa-sticky-note', before: '[^1]', after: '\n\n[^1]: 这里是注解内容', title: '脚注' },
        { icon: 'fa-percentage', before: '$', after: '$', title: '行内公式' },
        { icon: 'fa-calculator', before: '$$\n', after: '\n$$', title: '公式块' },
        { icon: 'fa-chevron-down', before: '<details>\n<summary>点击展开查看更多</summary>\n\n', after: '\n\n</details>', title: '折叠面板' },
        { icon: 'fa-info-circle', before: '> [!NOTE]\n> ', after: '', title: '提示框' },
    ]

    return (
        <div className="edit-toolbar">
            {tools.map((tool, index) => (
                <button
                    key={index}
                    className="tool-btn"
                    title={tool.title}
                    onClick={() => onInsert(tool.before, tool.after)}
                >
                    <i className={`fas ${tool.icon}`}></i>
                </button>
            ))}

            <div style={{ flex: 1 }}></div>

            <button
                className="tool-btn toggle-preview-btn"
                title={showPreview ? '隐藏预览' : '显示预览'}
                onClick={onTogglePreview}
            >
                <i className={showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>

            <div className="save-status">{saveStatus}</div>
        </div>
    )
}