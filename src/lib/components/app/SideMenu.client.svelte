<script lang="ts">
  import type { IChannel, IGuild } from '$lib/interfaces/delta';
  import Download from '$lib/svg/download.svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { writable } from 'svelte/store';
  import { relaunch } from '@tauri-apps/plugin-process';
  import { check } from '@tauri-apps/plugin-updater';
  import { onMount } from 'svelte';

  const {
    channel,
    guild,
    channels,
  }: {
    channel: Pick<IChannel, 'id' | 'name' | 'type'>;
    guild: Pick<IGuild, 'id' | 'name' | 'members' | 'ownerId' | 'icon'>;
    channels: Pick<IChannel, 'id' | 'name' | 'type'>[];
  } = $props();

  let updateAvailable = $state<boolean>();
  let menu = writable<HTMLElement>();

  onMount(async () => {
    if (updateAvailable === undefined) updateAvailable = (await check())?.available || false;
  });

  // on click, if its not in the menu, close the menu
  document.addEventListener('click', (e) => {
    if (!$menu || (e.target as HTMLElement).ariaLabel === 'menu-button') return;
    if (!$menu.contains(e.target as Node)) $menu.dataset.open = 'false';
  });

  async function updateAndDownload() {
    updateAvailable = false;
    alert('Downloading update...');
    await invoke('update');
    await relaunch();
  }
</script>

<section class="relative w-full bg-white dark:bg-#1F1F1F max-h-40px m-0">
  <div>
    <!-- TODO: change this ugly format -->
    <span class="text-lg float-left py-1.5 px-2">#{channel.name} @ {guild.name}</span>
    <button
      aria-label="menu-button"
      title="Toggle Menu"
      class="mr-2 p-2 float-right"
      onclick={() => {
        if ($menu) $menu.dataset.open = $menu.dataset.open === 'true' ? 'false' : 'true';
      }}
    >
      ☰
    </button>
    {#if updateAvailable}
      <button title="Update" class="custom p-2 float-right" onclick={updateAndDownload}>
        <Download />
      </button>
    {/if}
  </div>

  <div
    bind:this={$menu}
    data-open={$menu?.dataset.open || 'false'}
    class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pl-0.5 b-l-1 b-black dark:b-white select-none"
  >
    <div class="pl-4 pr-2 flex justify-between items-center">
      <h2 class="p-2 text-lg">{guild.name}</h2>
      <button
        title="Close Menu"
        class="p-2"
        onclick={() => {
          if ($menu) $menu.dataset.open = 'false';
        }}
      >
        ✖
      </button>
    </div>
    <nav class="*:w-full text-start space-y-1">
      {#each channels as { id, name } (id)}
        <a
          href={`/channels/${guild.id}/${id}`}
          class="block px-2 py-1 text-cyan hover:bg-[var(--background-hover)] rounded-md {id ===
            channel.id && 'active'}"
        >
          {name}
        </a>
      {/each}
    </nav>
  </div>
</section>

<style lang="postcss">
  [data-open='true'] {
    transform: translateX(0);
  }

  [data-open='false'] {
    transform: translateX(100%);
  }

  a.active {
    @apply bg-#818181 dark:bg-#515151;
  }

  a {
    text-decoration: none;
    &.active {
      color: lime;
      pointer-events: none;
    }
  }

  :global button[title='Update'] svg {
    --svg-color: rgb(71, 152, 71);
  }
</style>
