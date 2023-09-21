import ReactMarkdown from 'react-markdown'
import RehypeSanitize from 'rehype-sanitize'
import RemarkEmoji from 'remark-emoji'
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis'

interface Props {
  children: string
  className?: string
}

function linkTargetTransform(href: string) {
  if (!href.startsWith('/')) {
    return '_blank'
  }
}

export function Markdown({ children: markdown, className }: Props) {
  return (
    <ReactMarkdown
      className={`prose ${className ?? ''}`}
      rehypePlugins={[RehypeSanitize, rehypeAccessibleEmojis]}
      remarkPlugins={[RemarkEmoji]}
      linkTarget={linkTargetTransform}
    >
      {markdown}
    </ReactMarkdown>
  )
}
