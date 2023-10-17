import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Tab,
  Tabs,
  Textarea,
} from '@nextui-org/react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import { Book as BookType } from '~books/types'

import { Markdown } from '../components/markdown'
import { useEntityApiQuery } from '../hooks/use-entity-api-query'

interface OwnProps {
  id: string
}

type Props = OwnProps & Pick<ModalProps, 'isOpen' | 'onClose'>

// https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
const isbnPattern =
  /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/

const onSubmit = (data) => {
  console.log(data)
}

export function BookEditModal({ id, isOpen, onClose }: Props) {
  const {
    data: book,
    error,
    isError,
    isLoading,
    isFetching,
    isSuccess,
  } = useEntityApiQuery<BookType>('book', id, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isOpen,
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<
    Pick<BookType, 'authors' | 'coverURL' | 'isbn' | 'synopsis' | 'title'>
  >({ defaultValues: book })
  const currentSynopsisMarkdown = watch('synopsis')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(close) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Edit {book?.title}</ModalHeader>
            <ModalBody>
              <Input
                label="Title"
                placeholder="Book title"
                {...register('title')}
              />
              <Input
                label="ISBN"
                placeholder="0-553-29335-4"
                isInvalid={!!errors.isbn}
                errorMessage={errors.isbn?.message}
                {...register('isbn', {
                  pattern: isbnPattern,
                })}
              />
              <Tabs variant="underlined">
                <Tab key="raw" title="Synopsis">
                  <Textarea
                    className="resize-y"
                    placeholder="Book synopsis"
                    {...register('synopsis')}
                  />
                </Tab>
                <Tab key="rendered" title="Preview">
                  <Markdown className="mx-auto max-h-[188px] overflow-y-scroll">
                    {currentSynopsisMarkdown ?? ''}
                  </Markdown>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  reset(book)
                  close()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="primary" onClick={close}>
                Save
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}
