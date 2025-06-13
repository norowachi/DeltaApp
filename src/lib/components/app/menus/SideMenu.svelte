<script lang="ts">
  import { appearance, currentUser, sidemenu } from '$lib/store.svelte';
  import { writable } from 'svelte/store';
  import { Pin, PinOff, X } from '@lucide/svelte';

  const {
    channel,
    guild,
    channels,
  }: {
    channel: Pick<IChannel, 'id' | 'name' | 'type'>;
    guild: Pick<IGuild, 'id' | 'name' | 'members' | 'ownerId' | 'icon'>;
    channels: Pick<IChannel, 'id' | 'name' | 'type'>[];
  } = $props();

  const resizer = writable<HTMLDivElement>();

  /// Menu Resizing Logic
  let firstLeft = 0;
  let mousex = 0;

  const handleMouseDown = function (e: MouseEvent) {
    // get current mouse position
    mousex = e.clientX;
    firstLeft = $sidemenu?.getBoundingClientRect().width || 0;

    // attach helping listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = function (e: MouseEvent) {
    if (!$sidemenu) return;

    const deltaX = e.clientX - mousex;
    // set new width, if sidemenu elm exists ig
    $sidemenu.style.width = firstLeft + deltaX + 'px';

    // keep the cursor consistent when moving
    // TODO: make it show the cursor resizer/column on the side closest to the bar
    document.body.style.cursor = 'ew-resize';
    // disables the annoying select
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = function () {
    // reset styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // remove handlers
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
</script>

<div
  bind:this={$sidemenu}
  data-open={$appearance?.sideMenuPinned ? 'true' : $sidemenu?.dataset.open || 'false'}
  class="fixed top-0 left-0 h-full min-w-200px w-64 max-[440px]:w-full max-w-100dvw bg-white dark:bg-#1F1F1F transition-transform duration-300 z-999999 pr-0.5 b-r-1 b-black dark:b-white select-none ease resize-x"
  aria-label="sidemenu"
>
  <!-- h 44px -->
  <div class="w-full h-50px p-2 inline-flex items-center">
    {#if !$appearance?.sideMenuPinned}
      <button
        title="Close Menu"
        class="pl-2"
        onclick={() => {
          if ($sidemenu) $sidemenu.dataset.open = 'false';
        }}
      >
        <X />
      </button>
    {/if}
    <h2 class="mx-auto text-lg text-center">{guild.name}</h2>
    {#if window.innerWidth > 500}
      {#if $appearance?.sideMenuPinned}
        <button
          title="UnPin Menu"
          onclick={() => appearance.update((a) => ({ ...a, sideMenuPinned: false }))}
        >
          <PinOff />
        </button>
      {:else}
        <button
          title="Pin Menu"
          onclick={() => appearance.update((a) => ({ ...a, sideMenuPinned: true }))}
        >
          <Pin />
        </button>
      {/if}
    {/if}
  </div>
  <!-- h 100%-(100px + extra empty space) -->
  <nav class="*:w-full h-[calc(100dvh-102px)] text-start space-y-1 overflow-y-scroll">
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
  <!-- h 50px -->
  <div id="user-settings" class="fixed w-full h-50px bg-[var(--background-hover)] bottom-0">
    <img class="w-8 h-8 rounded-full float-left m-1" src={$currentUser.avatar} alt="User Avatar" />
    <span>{$currentUser.username}</span>
  </div>
</div>
{#if $appearance?.sideMenuPinned}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={$resizer}
    role="separator"
    class="fixed w-10px h-100dvh hover:bg-#cbd5e0 opacity-70 cursor-ew-resize z-999999"
    style="transform: translateX({$sidemenu?.getBoundingClientRect().right - 5.5 || 0}px)"
    onmousedown={handleMouseDown}
  ></div>
{/if}

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
</style>
