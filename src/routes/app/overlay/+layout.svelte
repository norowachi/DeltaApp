<script lang="ts">
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<main
  class="flex flex-col justify-center select-none overflow-hidden w-full h-100dvh bg-dark-9 opacity-90 hover:bg-dark-8 hover:opacity-100 transition-colors duration-200"
>
  {@render children()}
</main>

<style>
  :root {
    --background-color: transparent;
  }
</style>
