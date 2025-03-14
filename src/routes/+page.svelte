<script lang="ts">
  import Cookie from '$lib/svg/cookie.svelte';
  import LoginForm from '../lib/components/LoginForm.client.svelte';
  import RegisterForm from '../lib/components/RegisterForm.client.svelte';

  let ShowRegister = $state(false);
</script>

<h1 class="text-5xl text-center my-4">
  Welcome to <span class="text-black text-shadow-lg text-shadow-color-gray-5">Delta</span>
</h1>

{#if ShowRegister}
  <RegisterForm>
    <button
      class="mt-2 cursor-pointer underline text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-500"
      onclick={() => (ShowRegister = false)}
      type="button"
    >
      Have an account? Log in!
    </button>
  </RegisterForm>
{:else}
  <LoginForm>
    <button
      class="mt-2 cursor-pointer underline text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-500"
      onclick={() => (ShowRegister = true)}
    >
      Create an account
    </button>
  </LoginForm>
{/if}
<a
  id="open_preferences_center"
  class="fixed bottom-3 right-3 cursor-pointer rounded-full z-999999 transition-all duration-500 ease hover:transform-rotate-360"
>
  <Cookie />
</a>
