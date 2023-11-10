import ReactMarkdown from 'react-markdown'
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis'
import RehypeExternalLinks from 'rehype-external-links'
import RehypeSanitize from 'rehype-sanitize'
import RemarkEmoji from 'remark-emoji'

import { cn } from '../utils/cn'

interface Props {
  readonly children: string
  readonly className?: string
}

export function Markdown({ children: markdown, className }: Props) {
  return (
    <article className={cn('prose dark:prose-invert', className)}>
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
