<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Sun from '$lib/svg/sun.svelte';
  import Moon from '$lib/svg/moon.svelte';
  import { appContainer, messages } from '$lib/store';
  import type { IMessage } from '$lib/interfaces/delta';

  let menu = writable<HTMLElement>();
  let opened = writable<boolean>(false);
  let canOpenNative = writable<boolean>(false);
  let controller = writable<AbortController>();

  let ClickedMessage = writable<IMessage>();

  onMount(() => HandleTheme(false));

  function HandleTheme(toggle = true) {
    // get old theme
    let oldOption = localStorage.getItem('theme');
    if (!oldOption) {
      oldOption = window.matchMedia(`(prefers-color-scheme: dark)`).matches ? 'dark' : 'light';
      localStorage.setItem('theme', oldOption);
    }
    // init new theme
    let newOption;
    // if its a toggle
    if (toggle) {
      // switch themes and save
      newOption = oldOption === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newOption);
    }
    // toggle the "dark" class
    document.body.classList.toggle(
      'dark',
      newOption === 'dark' || (!toggle && oldOption === 'dark'),
    );
    // toggle the "light" class
    document.body.classList.toggle(
      'light',
      newOption === 'light' || (!toggle && oldOption === 'light'),
    );
  }

  menu.subscribe(
    (menu) => {
      if (!menu) return;

      // abort old controller and reset a new one
      const NewController = new AbortController();
      if ($controller) $controller.abort();
      controller.set(NewController);

      const messageContainer = $appContainer || document.documentElement;

      // hide menu if its open
      document.addEventListener(
        'click',
        () => {
          opened.set(false);
          canOpenNative.set(false);
        },
        { signal: NewController.signal },
      );
      document.addEventListener('auxclick', () => opened.set(false), {
        signal: NewController.signal,
      });
      // open the context menu
      messageContainer.addEventListener('contextmenu', contextMenu, {
        signal: NewController.signal,
      });

      function contextMenu(e: MouseEvent) {
        if ($canOpenNative || !menu) {
          opened.set(false);
          canOpenNative.set(false);
          return;
        }

        // check if a message was the target clicked, if not ignore
        const messageParent = document
          .querySelectorAll(`div[id^="m"]`)
          .values()
          .filter((query) => query.contains(e.target as Node))
          .toArray();
        const message = $messages.find((m) => messageParent.find((element) => m.id === element.id));

        if (!messageParent || !message) return;
        // set the clicked message
        ClickedMessage.set(message);

        e.preventDefault();

        // Calculate the dimensions of the menu
        //? Displaying it since `display: none` elements return 0
        menu.style.display = 'block';
        const menuWidth = menu.clientWidth;
        const menuHeight = menu.clientHeight;
        menu.style.display = '';

        // Determine position for the menu
        let posX = e.pageX;
        let posY = e.pageY;

        // Check if the menu goes beyond the right edge of the window
        if (posX + menuWidth >= window.innerWidth) {
          posX = window.innerWidth - menuWidth * 1.1;
        }

        // Check if the menu goes beyond the bottom edge of the window
        if (posY + menuHeight >= window.innerHeight) {
          posY = window.innerHeight - menuHeight;
        }

        // Set the position of the menu
        menu.style.left = posX + 'px';
        menu.style.top = posY + 'px';

        // show menu
        opened.set(true);
        canOpenNative.set(true);
      }
    },
    () => $controller?.abort(),
  );

  onDestroy(() => $controller?.abort());
</script>

<div
  bind:this={$menu}
  data-open={$opened}
  class="context-menu absolute data-[open=false]:hidden data-[open=true]:block rounded-md border p-1 animation bg-gray-6 text-white border-black dark:border-white"
>
  <!-- TODO: Move this shit into settings -->
  <button onclick={() => HandleTheme(true)} class="*:space-x-1">
    <p class="hidden dark:flex text-nowrap">
      <Sun />
      <span>Light Mode</span>
    </p>
    <p class="flex dark:hidden text-nowrap">
      <Moon />
      <span>Dark Mode</span>
    </p>
  </button>
  <button
    onclick={() => {
      // TODO: something to tell the user that the copy was successful or so
      navigator.clipboard.writeText(
        `${location.origin}/channels/${$ClickedMessage.guildId || '@me'}/${$ClickedMessage.channelId}/${$ClickedMessage.id}`,
      );
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5" />
      <path d="M4 13.5V6a2 2 0 0 1 2-2h2" />
      <path
        d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"
      />
    </svg>
    <span>Copy Link</span>
  </button>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .animation {
    &[data-open='false'] {
      animation-name: exit;
      animation-duration: 0.15s;
      --tw-exit-opacity: 0;
      --tw-exit-scale: 0.95;
      --tw-exit-rotate: initial;
      --tw-exit-translate-x: initial;
      --tw-exit-translate-y: initial;
    }
    &[data-open='true'] {
      animation-name: enter;
      animation-duration: 0.15s;
      --tw-enter-opacity: 0.8;
      --tw-enter-scale: 0.95;
      --tw-enter-rotate: initial;
      --tw-enter-translate-x: initial;
      --tw-enter-translate-y: initial;
    }
  }

  :global .context-menu button {
    @apply w-full relative flex justify-between cursor-pointer select-none items-center rounded-md px-2 py-1.5 data-[state]:py-1.5 data-[state]:pl-8 data-[state]:pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 space-x-1;
    &:hover {
      @apply bg-[#cccccc] text-black;
    }
  }
</style>
