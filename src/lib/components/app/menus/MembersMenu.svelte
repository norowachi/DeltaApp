<script lang="ts">
  import { membersmenu } from '$lib/store.svelte';
  import type { IChannel } from '$lib/types/delta';
  import { X } from '@lucide/svelte';

  const { channel }: { channel: IChannel } = $props();
</script>

<div
  bind:this={$membersmenu}
  class="fixed top-0 right-0 h-full min-w-200px w-64 max-[440px]:w-full bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-r-1 b-black dark:b-white select-none ease"
  data-open={$membersmenu?.dataset.open || 'false'}
>
  <div class="flex items-center justify-center py-1 px-2">
    <button
      class="p-2"
      title="Close Menu"
      onclick={() => {
        if ($membersmenu) $membersmenu.dataset.open = 'false';
      }}
    >
      <X class="pointer-events-none" />
    </button>
    <h2 class="text-lg font-semibold">Members</h2>
  </div>
  <ul class="p-4 space-y-2">
    {#each channel.members as member}
      <li class="flex items-center space-x-2">
        <!-- <img src={member.avatar} alt={member.username} class="w-8 h-8 rounded-full" /> -->
        <span>{member}</span>
      </li>
    {/each}
  </ul>
</div>

<style lang="postcss">
  [data-open='true'] {
    transform: translateX(0);
  }

  [data-open='false'] {
    transform: translateX(100%);
  }
</style>
