<script lang="ts">
  import type { IChannel, IGuild } from '$lib/interfaces/delta';
  import Download from '$lib/svg/download.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { messageContainer, sidemenu } from '$lib/store';
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
    document.addEventListener('click', CloseMenu);
    document.addEventListener('auxclick', CloseMenu);
    // swipers and related logic
    $messageContainer?.addEventListener('scroll', handleScroll);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('touchmove', handlePointerMove);
    document.addEventListener('touchend', handlePointerUp);

    // TODO: check if update is REQUIRED and if so just download/install it
    if (updateAvailable === undefined) updateAvailable = await functions.checkForUpdate();
  });

  function CloseMenu(e: Event) {
    if (!$sidemenu || (e.target as HTMLElement).ariaLabel === 'menu-button') return;
    $sidemenu.dataset.open = 'false';
  }

  onDestroy(() => {
    document.removeEventListener('click', CloseMenu);
    document.removeEventListener('auxclick', CloseMenu);
    $messageContainer?.removeEventListener('scroll', handleScroll);
    document.removeEventListener('touchstart', handlePointerDown);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
  });

  // x, y, timestamp
  let start = [0, 0, 0];
  let current = [0, 0];
  let firstLeft = 0;
  let isSwiping = false;
  let isScrolling = false;

  function handleScroll() {
    isScrolling = true;
    console.log('scrolling');
  }

  function handlePointerDown(event: TouchEvent) {
    if (!$sidemenu) return;
    start = [event.changedTouches[0].clientX, event.changedTouches[0].clientY, Date.now()];
    firstLeft = $sidemenu.getBoundingClientRect().left;
    if (!isScrolling) isSwiping = true;
  }

  function handlePointerMove(event: TouchEvent) {
    if (!isSwiping || !$sidemenu) return;
    current = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    // if the swipe is in y-axis, ignore
    // if (Math.abs(start[1] - current[1]) >= 30) return;

    let newX = firstLeft + current[0] - start[0];

    // if swipe is beyond the item width, return to default
    if (Math.abs(newX) >= $sidemenu.clientWidth || newX >= 0)
      return ($sidemenu.style.transform = '');

    $sidemenu.style.transitionDuration = '0ms';

    $sidemenu.style.transform = 'translateX(' + newX + 'px)';
  }

  function handlePointerUp(event: TouchEvent) {
    if (!isSwiping || !$sidemenu) return;
    $sidemenu.style.transitionDuration = '';
    isSwiping = false;
    // TODO: better logic for the x-axis only swipes
    // if (Math.abs(start[1] - current[1]) >= 30) return ($sidemenu.style.transform = '');
    const isOpened = $sidemenu.dataset.open === 'true';
    const end = event.changedTouches[0].clientX;
    const diff = end - start[0];
    const bounding = Math.abs($sidemenu.getBoundingClientRect().right);
    const timelimit = 750;

    $sidemenu.style.transform = '';

    // not opened & from left to right
    if (!isOpened && diff > 0) {
      // if its dragged beyond the middle of the screen
      if (bounding >= $sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
        return ($sidemenu.dataset.open = 'true');
      } else {
        return ($sidemenu.dataset.open = 'false');
      }
    } else if (isOpened && diff < 0) {
      // if its dragged beyond the middle of the screen
      if (bounding <= $sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
        return ($sidemenu.dataset.open = 'false');
      } else {
        return ($sidemenu.dataset.open = 'true');
      }
    }
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
    class="fixed top-0 left-0 h-full w-64 max-[440px]:w-full max-w-100dvh bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-r-1 b-black dark:b-white select-none ease"
  >
    <div class="w-full p-2 inline-flex">
      <button
        title="Close Menu"
        class="pl-2"
        onclick={() => {
          if ($sidemenu) $sidemenu.dataset.open = 'false';
        }}
      >
        ✖
      </button>
      <h2 class="mx-auto text-lg text-center">{guild.name}</h2>
    </div>
    <nav class="*:w-full h-[calc(100dvh-50px)] text-start space-y-1 overflow-y-scroll">
      {#if channels}
        {#each channels as { id, name } (id)}
          <a
            href={`/channels/${guild.id}/${id}`}
            class="block px-2 py-1 text-cyan text-right hover:bg-[var(--background-hover)] rounded-md {id ===
              channel.id && 'active'}"
          >
            {name}
          </a>
        {/each}
      {/if}
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
