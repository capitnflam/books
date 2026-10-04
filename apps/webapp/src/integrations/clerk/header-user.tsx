import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start';

export default function HeaderUser() {
  return (
    <>
      <Show when="signed-in">
        <UserButton userProfileUrl="/me" />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal" withSignUp />
      </Show>
    </>
  );
}
