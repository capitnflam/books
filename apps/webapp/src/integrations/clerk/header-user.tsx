import { Show, SignInButton, UserButton, useUser } from '@clerk/tanstack-react-start'

export default function HeaderUser() {
  const user = useUser()

  console.log('HeaderUser rendered', user.isSignedIn)
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
