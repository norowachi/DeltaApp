<script lang="ts">
  import functions from '$lib/api/tauri';
  import { appearance, heights, membersmenu, sidemenu } from '$lib/store.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { Download, Menu, UsersRound } from '@lucide/svelte';
  import { currentMonitor } from '@tauri-apps/api/window';

  const {
    channel,
    guild,
  }: {
    channel: Pick<IChannel, 'id' | 'name' | 'type'>;
    guild: Pick<IGuild, 'id' | 'name' | 'members' | 'ownerId' | 'icon'>;
    channels: Pick<IChannel, 'id' | 'name' | 'type'>[];
  } = $props();

  let updateAvailable = $state<boolean>();

  onMount(async () => {
    // mostly a check for development, but who knows if it'll be useful in the future for prod
    registerEvents();

    // TODO: check if update is REQUIRED and if so just download/install it
    if (updateAvailable === undefined) updateAvailable = await functions.checkForUpdate();
  });

  async function updateAndDownload() {
    updateAvailable = false;
    alert('Downloading update...');
    functions.update();
  }

  onDestroy(destroyEvents);

  // events
  function registerEvents() {
    document.addEventListener('click', CloseMenu);
    document.addEventListener('auxclick', CloseMenu);
    // swipers and related logic
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  }

  function destroyEvents() {
    document.removeEventListener('click', CloseMenu);
    document.removeEventListener('auxclick', CloseMenu);
    document.removeEventListener('touchstart', handlePointerDown);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
  }

  // function for closing the menu and its logic/exceptions
  function CloseMenu(e: Event) {
    const target = e.target as HTMLElement;
    if (
      !($sidemenu && $membersmenu) ||
      // for sidemenu channels
      ($sidemenu.contains(target) && target.tagName !== 'A') ||
      target.role === 'separator'
    )
      return;
    if (target.ariaLabel !== 'sidemenu-button' && !$appearance?.sideMenuPinned)
      $sidemenu.dataset.open = 'false';
    if (target.ariaLabel !== 'membersmenu-button') $membersmenu.dataset.open = 'false';
  }

  /// Menu Swiping Logic
  /* x, y, timestamp */
  let start = [0, 0, 0];
  let current = [0, 0];
  let firstPos = [0, 0];
  let isSwiping = false;
  let menu: HTMLElement | undefined;

  function handlePointerDown(event: TouchEvent) {
    if (!$sidemenu || !$membersmenu) return;
    start = [event.changedTouches[0].clientX, event.changedTouches[0].clientY, Date.now()];
    firstPos[0] = $sidemenu.getBoundingClientRect().left;
    firstPos[1] = $membersmenu.getBoundingClientRect().left;
    isSwiping = true;
  }

  function handlePointerMove(event: TouchEvent) {
    if (!isSwiping || !$sidemenu || !$membersmenu) return;
    current = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];

    const deltaX = current[0] - start[0];
    const deltaY = current[1] - start[1];

    // If vertical movement is greater, ignore the move
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      $sidemenu.style.transform = '';
      $membersmenu.style.transform = '';
      return (isSwiping = false);
    } else event.preventDefault();

    navigator.virtualKeyboard.hide();

    [$sidemenu, $membersmenu].map((CurrentMenu, i, arr) => {
      // if the other menu is opened, ignore the swipe
      if (arr[(i + 1) % arr.length].dataset.open === 'true') return;
      if (CurrentMenu.ariaLabel === 'sidemenu' && $appearance?.sideMenuPinned) return;

      let newX = firstPos[i] + deltaX;

      // if swipe is beyond the item width, return to default
      if (
        Math.abs(newX) >= CurrentMenu.clientWidth ||
        (i === 0 && newX >= 0) ||
        (i === 1 && newX <= 0)
      )
        return (CurrentMenu.style.transform = '');

      CurrentMenu.style.transitionDuration = '0ms';

      CurrentMenu.style.transform = 'translateX(' + newX + 'px)';

      menu = CurrentMenu;
    });
  }

  function handlePointerUp(event: TouchEvent) {
    if (!isSwiping || !menu) return;
    isSwiping = false;
    const end = event.changedTouches[0].clientX;
    const timelimit = 300;
    let diff = end - start[0];

    menu.style.transitionDuration = '';
    menu.style.transform = '';

    // check if the menu is the sidemenu & if it is pinned
    if (menu.ariaLabel === 'sidemenu' && $appearance?.sideMenuPinned) return;

    let bounding = Math.abs(
      menu.ariaLabel === 'membersmenu'
        ? menu.getBoundingClientRect().left
        : menu.getBoundingClientRect().right,
    );

    const isOpened = menu.dataset.open === 'true';

    let clientWidth = menu.clientWidth;

    // members menu is on the right side, so we need to invert the diff
    if (menu.ariaLabel === 'membersmenu') {
      diff = -diff;
      clientWidth = -clientWidth;
      bounding = -bounding;
    }

    //? Comments here reference the logic of the sidemenu only
    // not opened & from left to right
    if (!isOpened && diff > 0) {
      // if its dragged beyond the middle of the screen
      if (bounding >= clientWidth / 2 || Date.now() - start[2] <= timelimit) {
        return (menu.dataset.open = 'true');
      } else {
        return (menu.dataset.open = 'false');
      }
    } else if (isOpened && diff < 0) {
      // if its dragged beyond the middle of the screen
      if (bounding <= clientWidth / 2 || Date.now() - start[2] <= timelimit) {
        return (menu.dataset.open = 'false');
      } else {
        return (menu.dataset.open = 'true');
      }
    }
  }
</script>

<div bind:clientHeight={heights[0]} class="relative w-full bg-white dark:bg-#1F1F1F max-h-40px m-0">
  <!-- TODO: change this ugly format -->
  <span class="text-lg float-right py-1.5 px-2">{guild.name} #{channel.name}</span>
  <button
    aria-label="membersmenu-button"
    title="Show Members"
    class="p-2 float-right"
    onclick={() => {
      if ($membersmenu)
        $membersmenu.dataset.open = $membersmenu.dataset.open === 'true' ? 'false' : 'true';
    }}
  >
    <UsersRound class="pointer-events-none" />
  </button>
  <button
    aria-label="sidemenu-button"
    title="Toggle Menu"
    class="ml-2 p-2 float-left"
    onclick={() => {
      if ($sidemenu) $sidemenu.dataset.open = $sidemenu.dataset.open === 'true' ? 'false' : 'true';
    }}
  >
    <Menu class="pointer-events-none" />
  </button>
  {#if updateAvailable}
    <button title="Update" class="p-2 float-right" onclick={updateAndDownload}>
      <Download color="rgb(71, 152, 71)" />
    </button>
  {/if}
</div>
