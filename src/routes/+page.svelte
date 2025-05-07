<script lang="ts">
  import { page } from '$app/state';
  import LoginForm from '../lib/components/LoginForm.client.svelte';
  import RegisterForm from '../lib/components/RegisterForm.client.svelte';

  let ShowRegister = $state(false);
</script>

<h1 class="text-5xl text-center my-4">
  Welcome to
  {#if page.url.hostname === 's.ily.cat'}
    <a href="https://s.ily.cat" class="gradient">s.ily.cat</a>
  {:else}
    <span class="text-black text-shadow-lg text-shadow-color-gray-5">Delta</span>
  {/if}
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


<style>
  @keyframes animate-gradient {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }
  .gradient {
    animation: animate-gradient 3s linear infinite;
    background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ffff00, #00ffff, #ff00ff, #ff0000);
    background-size: 200% 100%;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
</style>
