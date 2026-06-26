import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'

export default function HeaderUser() {
  return (
    <>
      <Show when="signed-in">
        bar
        <UserButton />
      </Show>
      <Show when="signed-out">
        foo
        <SignInButton />
      </Show>
    </>
  )
}
