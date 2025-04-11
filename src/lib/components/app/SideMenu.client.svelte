<script lang="ts">
  import type { IChannel, IGuild } from '$lib/interfaces/delta';
  import Download from '$lib/svg/download.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { sidemenu } from '$lib/store';
  import functions from '$lib/api/tauri';

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

  onMount(async () => {
    // TODO: check if update is REQUIRED and if so just download/install it
    if (updateAvailable === undefined) updateAvailable = await functions.checkForUpdate();
  });

  function CloseMenu(e: Event) {
    if (!$sidemenu || (e.target as HTMLElement).ariaLabel === 'menu-button') return;
    $sidemenu.dataset.open = 'false';
  }

  document.addEventListener('click', CloseMenu);
  document.addEventListener('auxclick', CloseMenu);
  // swipers
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

  // x, y, timestamp
  let start = [0, 0, 0];
  let current = [0, 0];
  let firstLeft = 0;
  let isSwiping = false;

  function handlePointerDown(event: TouchEvent) {
    start = [event.changedTouches[0].clientX, event.changedTouches[0].clientY, Date.now()];
    firstLeft = $sidemenu.getBoundingClientRect().left;
    isSwiping = true;
  }

  function handlePointerMove(event: TouchEvent) {
    if (!isSwiping) return;
    // if the swipe is in y-axis, ignore
    current = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    if (Math.abs(start[1] - current[1]) >= 30) return;

    let newX = firstLeft + current[0] - start[0];

    if (Math.abs(newX) > $sidemenu.clientWidth) return;

    $sidemenu.style.transitionDuration = '0ms';

    if (current[0] <= $sidemenu.clientWidth) {
      $sidemenu.style.transform = 'translateX(' + newX + 'px)';
    }
  }

  function handlePointerUp(event: TouchEvent) {
    if (!isSwiping) return;
    $sidemenu.style.transitionDuration = '';
    isSwiping = false;
    if (Math.abs(start[1] - current[1]) >= 30) return ($sidemenu.style.transform = '');
    const isOpened = $sidemenu.dataset.open === 'true';
    const end = event.changedTouches[0].clientX;
    const diff = end - start[0];
    const bounding = Math.abs($sidemenu.getBoundingClientRect().right);
    const timelimit = 750;

    const temp = () => {
      // not opened & from left to right
      if (!isOpened && diff > 0) {
        // if its dragged beyond the middle of the screen
        if (bounding >= $sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
          return 1;
        } else {
          return 0;
        }
      } else if (isOpened && diff < 0) {
        // if its dragged beyond the middle of the screen
        if (bounding <= $sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
          return 0;
        } else {
          return 1;
        }
      }
    };

    if (temp() === 1) {
      // open
      $sidemenu.dataset.open = 'true';
    } else if (temp() === 0) {
      // close
      $sidemenu.dataset.open = 'false';
    }

    $sidemenu.style.transform = '';
  }

  async function updateAndDownload() {
    updateAvailable = false;
    alert('Downloading update...');
    functions.update();
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
        if ($sidemenu)
          $sidemenu.dataset.open = $sidemenu.dataset.open === 'true' ? 'false' : 'true';
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
    bind:this={$sidemenu}
    data-open={$sidemenu?.dataset.open || 'false'}
    class="fixed top-0 left-0 h-full w-full lg:w-64 max-w-100dvh bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-r-1 b-black dark:b-white select-none ease"
  >
    <div class="pr-4 pl-2 flex justify-between items-center">
      <button
        title="Close Menu"
        class="p-2"
        onclick={() => {
          if ($sidemenu) $sidemenu.dataset.open = 'false';
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
