<script lang="ts">
  import type { IChannel, IGuild } from '$lib/interfaces/delta';
  import Download from '$lib/svg/download.svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { writable } from 'svelte/store';
  import { relaunch } from '@tauri-apps/plugin-process';
  import { check } from '@tauri-apps/plugin-updater';
  import { onDestroy, onMount } from 'svelte';

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
    // TODO: check if update is REQUIRED and if so just download/install it
    if (updateAvailable === undefined)
      updateAvailable = (await check().catch(() => {}))?.available || false;
  });

  function CloseMenu(e: Event) {
    if (!$menu || (e.target as HTMLElement).ariaLabel === 'menu-button') return;
    if (!$menu.contains(e.target as Node)) $menu.dataset.open = 'false';
  }

  document.addEventListener('click', CloseMenu);
  document.addEventListener('auxclick', CloseMenu);
  // swipers
  // TODO: Add more swipe logic
  document.addEventListener('touchstart', handlePointerDown);
  document.addEventListener('touchmove', handlePointerMove);
  document.addEventListener('touchend', handlePointerUp);

  onDestroy(() => {
    document.removeEventListener('click', CloseMenu);
    document.removeEventListener('auxclick', CloseMenu);
    document.removeEventListener('touchstart', handlePointerDown);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
  });

  let start = [0, 0];
  let current = [0, 0];
  let firstLeft = 0;
  let isSwiping = false;

  function handlePointerDown(event: TouchEvent) {
    start = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    firstLeft = $menu.getBoundingClientRect().left;
    isSwiping = true;
  }

  function handlePointerMove(event: TouchEvent) {
    if (!isSwiping) return;
    current = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    // if the swipe is in y-axis, ignore
    if (Math.abs(start[1] - current[1]) > 30) return;
    let newX = current[0] + (firstLeft || -start[0]);
    console.log('newX', newX, current[0], start[0], firstLeft);

    if (newX <= 0) {
      // if the start point is too far, subtract the difference
      if (start[0] > $menu.clientWidth) {
        console.log('decreasing');
        newX = newX + (start[0] - $menu.clientWidth);
      }
      //
      if (current[0] <= $menu.clientWidth) {
        $menu.style.transform = 'translateX(' + newX + 'px)';
      }
    }
  }

  function handlePointerUp(event: TouchEvent) {
    isSwiping = false;
    const isOpened = $menu.dataset.open === 'true';
    const threhold = (2.5 * $menu.clientWidth) / 10;
    const end = event.changedTouches[0].clientX;
    const diff = end - start[0];
    const bounding = $menu.getBoundingClientRect().right;

    const temp = () => {
      // not opened & from left to right
      if (!isOpened && diff > 0) {
        // if its dragged beyond the middle of the screen
        if (bounding > $menu.clientWidth / 2 || diff <= threhold) {
          return 1;
        } else {
          return 0;
        }
        // not opened & right to left
      } else if (!isOpened && diff < 0) {
        return 0;
        // opened & right to left
      } else if (isOpened && diff < 0) {
        if (bounding > $menu.clientWidth / 2 || diff <= threhold) {
          return 0;
        } else {
          return 1;
        }
      }
    };

    if (temp() === 1) {
      // open
      $menu.dataset.open = 'true';
    } else if (temp() === 0) {
      // close
      $menu.dataset.open = 'false';
    }

    $menu.style.transform = '';
  }

  async function updateAndDownload() {
    updateAvailable = false;
    alert('Downloading update...');
    await invoke('update_application');
    await relaunch();
  }
</script>

<section class="relative w-full bg-white dark:bg-#1F1F1F max-h-40px m-0">
  <div>
    <!-- TODO: change this ugly format -->
    <span class="text-lg float-right py-1.5 px-2">{guild.name} #{channel.name}</span>
    <button
      aria-label="menu-button"
      title="Toggle Menu"
      class="ml-2 p-2 float-left"
      onclick={() => {
        if ($menu) $menu.dataset.open = $menu.dataset.open === 'true' ? 'false' : 'true';
      }}
    >
      ☰
    </button>
    {#if updateAvailable}
      <button title="Update" class="custom p-2 float-left" onclick={updateAndDownload}>
        <Download />
      </button>
    {/if}
  </div>

  <div
    bind:this={$menu}
    data-open={$menu?.dataset.open || 'false'}
    class="fixed top-0 right-0 h-full w-full max-w-100dvh bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-r-1 b-black dark:b-white select-none"
  >
    <div class="pr-4 pl-2 flex justify-between items-center">
      <button
        title="Close Menu"
        class="p-2"
        onclick={() => {
          if ($menu) $menu.dataset.open = 'false';
        }}
      >
        ✖
      </button>
      <h2 class="p-2 text-lg">{guild.name}</h2>
    </div>
    <nav class="*:w-full text-start space-y-1">
      {#each channels as { id, name } (id)}
        <a
          href={`/channels/${guild.id}/${id}`}
          class="block px-2 py-1 text-cyan text-right hover:bg-[var(--background-hover)] rounded-md {id ===
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
    transform: translateX(-100%);
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
    color: rgb(71, 152, 71);
  }
</style>
