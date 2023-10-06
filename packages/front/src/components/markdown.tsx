import ReactMarkdown from 'react-markdown'
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis'
import RehypeExternalLinks from 'rehype-external-links'
import RehypeSanitize from 'rehype-sanitize'
import RemarkEmoji from 'remark-emoji'

interface Props {
  children: string
  className?: string
}

export function Markdown({ children: markdown, className }: Props) {
  return (
    <article className={`prose dark:prose-invert ${className ?? ''}`}>
      <ReactMarkdown
        rehypePlugins={[
          RehypeSanitize,
          RehypeExternalLinks,
          rehypeAccessibleEmojis,
        ]}
        remarkPlugins={[RemarkEmoji]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
