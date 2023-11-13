import { DevTool } from '@hookform/devtools'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { BookResult, bookRequestSchema } from '~books/types'

import { Markdown } from '../components/markdown'
import { getBookQuery } from '../queries/book/get'
import { updateBook } from '../services/book/update'

interface OwnProps {
  readonly id: string
}

type Props = OwnProps & Pick<ModalProps, 'isOpen' | 'onClose'>

export function BookEditModal({ id, isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const getQuery = getBookQuery(`/book/${id}`, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isOpen,
    staleTime: Infinity,
  })

  const { data: book } = useQuery(getQuery)

  const { mutate } = useMutation({
    mutationFn: updateBook,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getQuery.queryKey }),
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookResult>({
    defaultValues: book,
    resolver: zodResolver(bookRequestSchema),
  })
  const currentSynopsisMarkdown = watch('synopsis')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalContent>
        {(close) => (
          <>
            <form
              onSubmit={handleSubmit(
                (values) => {
                  return mutate(values, {
                    onSuccess: () => {
                      reset()
                      close()
                    },
                  })
                },
                (errors) => {
                  // TODO
                  console.error('errors', errors)
                },
              )}
            >
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
                  {...register('isbn')}
                />
                <Tabs variant="underlined">
                  <Tab key="raw" title="Synopsis">
                    <Textarea
                      maxRows={20}
                      placeholder="Book synopsis"
                      {...register('synopsis')}
                    />
                  </Tab>
                  <Tab key="rendered" title="Preview">
                    <div className="rounded-medium bg-default-100 px-3 py-2 shadow-sm outline-none !duration-150 tap-highlight-transparent transition-background motion-reduce:transition-none">
                      <Markdown className="max-h-[428px] w-full max-w-full overflow-y-scroll">
                        {currentSynopsisMarkdown ?? ''}
                      </Markdown>
                    </div>
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
                <Button type="submit" color="primary">
                  Save
                </Button>
              </ModalFooter>
            </form>
            <DevTool control={control} placement="top-left" />
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
