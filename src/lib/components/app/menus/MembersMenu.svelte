<script lang="ts">
  import { membersmenu } from '$lib/store.svelte';
  import { X } from '@lucide/svelte';
  import UserAvatar from '../UserAvatar.svelte';

  const { channel, members }: { channel: IChannel; members: IUser[] } = $props();
</script>

<div
  bind:this={$membersmenu}
  class="fixed top-0 right-0 h-full min-w-200px w-64 max-[440px]:w-full max-w-100dvw bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-l-1 b-black dark:b-white select-none ease"
  data-open={$membersmenu?.dataset.open || 'false'}
  aria-label="membersmenu"
>
  <div class="flex items-center py-1 px-2">
    <button
      class="p-2"
      title="Close Menu"
      onclick={() => {
        if ($membersmenu) $membersmenu.dataset.open = 'false';
      }}
    >
      <X class="pointer-events-none" />
    </button>
    <h2 class="absolute text-lg font-semibold ml-1/3">Members</h2>
  </div>
  <div class="m-2">
    <!-- TODO: open user profile or perform some action on click -->
    {#each members.filter((m) => channel.members.includes(m.id)) as member}
      <button
        class="w-full flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-[var(--background-hover)] gap-2"
        onclick={() => console.log(`Clicked on member: ${member.username}`)}
      >
        <UserAvatar author={member} />
        <span>{member.username}</span>
      </button>
    {/each}
  </div>
</div>

<style lang="postcss">
  [data-open='true'] {
    transform: translateX(0);
  }

  [data-open='false'] {
    transform: translateX(100%);
  }
</style>
