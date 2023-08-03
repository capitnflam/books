import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import RehypeSanitize from 'rehype-sanitize'
import RemarkEmoji from 'remark-emoji'

import { Spinner } from '../components/spinner'
import { RouteParams } from '../utils/route-params'

import { Book as BookType } from '@books/types'

type ParamsKey = 'id'

// TODO: remove
const bookFixtures: Record<string, BookType> = {
  '/book/21': {
    uri: '/book/21',
    coverURL:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAJYCAYAAABM7LCIAAAAAXNSR0IArs4c6QAAIABJREFUeF7t3eeuK8exBlDKOeecc4Df/y381znnnCVnW0YRmIM+rUmsvVnyqbM2IFxfic1mr2rON9MT+MJXv/rVly/+CBAgQIDAjQIvCJAbxbycAAECBK4CAsREIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSAAAECAsQcIECAAIGUgABJsWlEgAABAgLEHCBAgACBlIAASbFpRIAAAQICxBwgQIAAgZSAAEmxaUSA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',
    title: 'book title 1',
    synopsis: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut massa nisl, porttitor sed odio non, euismod tempor purus. Etiam blandit leo eget laoreet bibendum. Aenean rhoncus ligula eros, in hendrerit magna consequat sit amet. Integer quis nisl eu eros efficitur accumsan. Nam condimentum purus metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec sed quam eu mauris aliquam aliquam.

In hac habitasse platea dictumst. Aenean at sollicitudin felis. Quisque feugiat volutpat massa, sit amet congue nulla imperdiet sed. Praesent posuere metus in tellus ultrices euismod. Sed mattis ex in dui convallis rutrum. Integer mollis tincidunt felis, sollicitudin efficitur leo convallis non. Integer tincidunt fringilla elit non convallis. Donec volutpat tortor id elit pharetra, id consequat erat pulvinar. Cras rutrum leo neque, eu viverra odio eleifend sed. Praesent tortor elit, porttitor eu massa sit amet, pretium molestie lorem.

Pellentesque semper velit laoreet quam egestas, id dapibus sapien imperdiet. Phasellus vel malesuada sem. Morbi feugiat egestas lacus id auctor. Integer nec neque et orci viverra pellentesque ac ac magna. Morbi rhoncus diam pharetra lorem tincidunt, sit amet sollicitudin nulla pretium. Nullam eu justo sit amet dolor dignissim bibendum. Nullam eu magna sit amet odio dapibus hendrerit. Nunc convallis rutrum cursus.`,
    authors: [],
  },
  '/book/42': {
    uri: '/book/42',
    coverURL:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAYAAAAUufjgAAAAAXNSR0IArs4c6QAAAkVJREFUaEPtmNfKIkEQhWvMESPmHPD938MXkF9HEQMGxjTmMMupZWT3um4WthoG2+6uqnO+LgbU6Pf7Dv3Dw1CBwttRgkKApASVoJSANF57UAlKCUjjtQeVoJSANF57UAlKCUjjtQeVoJSANP7/7cFOp0OPx4Om0ylVKhVKJpPf77fb7S+woVCIarUaBYNBOhwONJ/PqVqtUjweJ8M0Ted+v9P5fKZoNEo4jATP55Pnx+ORAoHAd55IJMjj8fB6OBzmuWEYnNgdpVKJMpkMn8FTKBRYaD6fp8/nQ/v9nmtgjhzZbJbn6/WaEAtjqD0ej8mwLMvBl8vlwgKv1ytFIhFOjM/lckmxWIwTYXi9XnIchx8Ig3iYQzIMGICQ1+tF7/ebjYLEYDDg4siJdeRBvAsCApEL4rHn8/loNBr9/l0MAblcjl1MJhPGjcMQgQRAD1c4B+dYdwudTieazWZf8c1mk836/X5eQzzODofDr0Ccb7VavG+aJs9h0rIsvlqYQz1oYYHFYpGLYwMk6vU6OwBF4Icg4AcZJAEBGECMbdu0WCy4GG4AlCAOFGAYObD+8/ND5XKZ97bbLc9BEP2GvDC6Wq2o2+2yDgyYMmzbdtBHu92OUqkUJ4U4HIaYXq/H1w7hjUaDabhkUQDOXYF/dj5MYoBWu91mwaiz2Wy4DuJcUxCXTqfZOHKjNvqW20j/fhO+qZWgEKD2oBSgElSCYgLSBPoeVIJSAtJ47UElKCUgjdceVIJSAtJ47UElKCUgjdcelBL8BTAv9ZGJdRgkAAAAAElFTkSuQmCC',
    title: 'book title 2',
    synopsis: `**Lorem** *ipsum* dolor [sit](/foo/bar) [amet](https://www.google.com) :tada:, consectetur adipiscing elit. Ut massa nisl, porttitor sed odio non, euismod tempor purus. Etiam blandit leo eget laoreet bibendum. Aenean rhoncus ligula eros, in hendrerit magna consequat sit amet. Integer quis nisl eu eros efficitur accumsan. Nam condimentum purus metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec sed quam eu mauris aliquam aliquam.

In hac habitasse platea dictumst. Aenean at sollicitudin felis. Quisque feugiat volutpat massa, sit amet congue nulla imperdiet sed. Praesent posuere metus in tellus ultrices euismod. Sed mattis ex in dui convallis rutrum. Integer mollis tincidunt felis, sollicitudin efficitur leo convallis non. Integer tincidunt fringilla elit non convallis. Donec volutpat tortor id elit pharetra, id consequat erat pulvinar. Cras rutrum leo neque, eu viverra odio eleifend sed. Praesent tortor elit, porttitor eu massa sit amet, pretium molestie lorem.

Pellentesque semper velit laoreet quam egestas, id dapibus sapien imperdiet. Phasellus vel malesuada sem. Morbi feugiat egestas lacus id auctor. Integer nec neque et orci viverra pellentesque ac ac magna. Morbi rhoncus diam pharetra lorem tincidunt, sit amet sollicitudin nulla pretium. Nullam eu justo sit amet dolor dignissim bibendum. Nullam eu magna sit amet odio dapibus hendrerit. Nunc convallis rutrum cursus.`,
    authors: [
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
      { name: 'Isaac Asimov', uri: '/author/42' },
      { name: 'Ray Bradburry', uri: '/author/21' },
    ],
  },
}

function linkTargetTransform(href: string) {
  if (!href.startsWith('/')) {
    return '_blank'
  }
}

export function Book() {
  const { id } = useParams<RouteParams<ParamsKey>>()
  const {
    data: book,
    error,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ['book', id],
    queryFn: async ({ queryKey }) => {
      const [type, id] = queryKey
      const uri = `/${type}/${id}`
      // TODO: fetch from backend
      if (!bookFixtures[uri]) {
        throw new Error('foobar')
      }
      return Promise.resolve(bookFixtures[uri])
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <Spinner className="flex h-full w-full items-center justify-center" />
    )
  }

  if (isError) {
    // TODO
    return <span>{JSON.stringify(error)}</span>
  }

  if (!isSuccess) {
    // TODO
    return <span>Unknown error</span>
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex w-full flex-row">
        <div className="flex h-[600px] w-[400px] items-center justify-center">
          <img className="h-auto w-auto" src={book.coverURL} alt={book.title} />
        </div>
        <div className="w-full">
          <Link className="text-xl font-bold" to={book.uri}>
            {book.title}
          </Link>
          <div className="flex w-full flex-wrap">
            {book.authors.map((author, index) => (
              <Link
                key={`${author.name}_${index}`}
                className="m-1 rounded-full bg-blue-400 px-2"
                to={author.uri}
              >
                {author.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div>
        <ReactMarkdown
          rehypePlugins={[RehypeSanitize]}
          remarkPlugins={[RemarkEmoji]}
          linkTarget={linkTargetTransform}
        >
          {book.synopsis}
        </ReactMarkdown>
      </div>
    </div>
  )
}
