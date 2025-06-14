<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { currentUser, messageContainer, messages, theme } from '$lib/store.svelte';
  import { deleteMessage } from '$lib/api/message';
  import { ClipboardPen, Eye, Moon, PencilOff, Sun, Trash2 } from '@lucide/svelte';
  import { Roles } from '$lib/types/values';

  let menu = writable<HTMLElement | undefined>();
  let dialog = writable<HTMLDialogElement | undefined>();
  let opened = writable<boolean>(false);
  let canOpenNative = writable<boolean>(false);

  let ClickedMessage = writable<IMessage | undefined>();
  let ClickedElement = writable<HTMLElement | null>(null);

  onMount(() => {
    // hide menu if its open
    document.addEventListener('click', () => {
      $ClickedElement?.style.removeProperty('background-color');

      if ($dialog && $dialog.open)
        if (!$dialog.dataset.toggle) {
          $dialog.close();
        } else {
          $dialog.dataset.toggle = '';
          colorClickedElement();
        }

      opened.set(false);
    });
    // open the context menu
    $messageContainer.addEventListener('contextmenu', contextMenu);
  });

  function colorClickedElement() {
    if ($ClickedElement)
      $ClickedElement.style.setProperty(
        'background-color',
        'color-mix(in oklab, var(--background-hover) 50%, var(--higher-color) 30%)',
      );
  }

  function contextMenu(e: MouseEvent) {
    if ($canOpenNative || !$menu) {
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

    ClickedElement.update((old) => {
      // remove the old highlight
      if (old) {
        old.style.removeProperty('background-color');
      }
      return document.querySelector(`div[id="${message?.id}"]`);
    });

    colorClickedElement();

    e.preventDefault();

    // Calculate the dimensions of the menu
    //? Displaying it since `display: none` elements return 0
    $menu.style.display = 'block';
    const menuWidth = $menu.clientWidth;
    const menuHeight = $menu.clientHeight;
    $menu.style.display = '';

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
    $menu.style.left = posX + 'px';
    $menu.style.top = posY + 'px';

    // show menu
    opened.set(true);
  }

  const canDeleteMessages = $derived(
    $ClickedMessage?.author.id === $currentUser.id ||
      $currentUser.guilds.find(
        (guild) => guild.id === $ClickedMessage?.guildId && guild.ownerId === $currentUser.id,
      ),
  );
</script>

<dialog
  bind:this={$dialog}
  class="min-w-64 whitespace-pre-line bg-gray-6 text-white border border-black dark:border-white rounded-md py-4 px-8 space-y-3"
  onclose={() => {
    $ClickedElement?.style.removeProperty('background-color');
    if (!$dialog) return;
    Object.keys($dialog.dataset).map((key) => delete $dialog?.dataset[key]);
  }}
>
  <p class="text-center">
    <span>{$dialog?.dataset.message || 'Are You Sure?'}</span>
    {#if $dialog?.dataset.note}
      <br />
      <span class="text-gray-400 text-sm">{$dialog?.dataset.note}</span>
    {/if}
  </p>
  {#if $dialog?.dataset.buttons !== 'false'}
    <form method="dialog" class="flex justify-between">
      <button type="reset" class="px-2 py-1 h-34px rounded-md bg-#ff000033 hover:bg-red-9">
        Cancel
      </button>
      <!-- svelte-ignore a11y_autofocus -->
      <button
        type="submit"
        class="px-2 py-1 h-34px rounded-md bg-red-6 hover:bg-green transition-colors duration-800 ease-in-out"
        autofocus
        onclick={() => {
          if (!$dialog) return;
          // actions switch
          switch ($dialog.dataset.action) {
            case 'delete':
              if ($ClickedMessage) deleteMessage($ClickedMessage);
              break;
            default:
              break;
          }
        }}
      >
        Confirm
      </button>
    </form>
  {/if}
</dialog>

<div
  bind:this={$menu}
  data-open={$opened}
  class="context-menu absolute data-[open=false]:hidden data-[open=true]:block rounded-md border p-1 animation bg-gray-6 text-white border-black dark:border-white space-y-1"
>
  <!-- TODO: Move this shit into settings -->
  <button onclick={() => theme.set($theme === 'dark' ? 'light' : 'dark')} class="btn hover">
    {#if $theme == 'light'}
      <Moon />
      <span>Dark Mode</span>
    {:else}
      <Sun />
      <span>Light Mode</span>
    {/if}
  </button>
  <button
    class="btn hover"
    onclick={() => {
      if ($dialog) {
        $dialog.dataset.toggle = 'clipboard';
        $dialog.dataset.message = 'Message link has been copied to the clipboard!';
        $dialog.dataset.buttons = 'false';
        $dialog.showModal();
        setTimeout(() => $dialog?.close(), 1000);
      }

      navigator.clipboard.writeText(
        `${location.origin}/channels/${$ClickedMessage!.guildId || '@me'}/${$ClickedMessage!.channelId}/${$ClickedMessage!.id}`,
      );
    }}
  >
    <ClipboardPen />
    <span>Copy Message Link</span>
  </button>
  {#if canDeleteMessages || $currentUser.roles & Roles.STAFF}
    <button
      class="btn bg-red-6 hover:bg-red-9"
      data-dialog
      onclick={(e) => {
        if (e.shiftKey) return deleteMessage($ClickedMessage!);
        if (!$dialog) return;
        $dialog.dataset.toggle = 'delete';
        $dialog.dataset.message = 'Are you sure you want to delete this message?';
        $dialog.dataset.note = 'Press Shift while clicking to delete a message instantly';
        $dialog.dataset.action = 'delete';
        $dialog.showModal();
      }}
    >
      <Trash2 />
      <span>
        Delete Message {!canDeleteMessages && $currentUser.roles & Roles.STAFF ? '(Force)' : ''}
      </span>
    </button>
  {/if}
  {#if $currentUser.roles & Roles.STAFF}
    <button
      class="btn hover:bg-amber hover:text-black"
      onclick={() => {
        if (!$dialog) return;
        $dialog.dataset.toggle = 'view';
        $dialog.dataset.message = $ClickedMessage?.content || 'No Content';
        $dialog.dataset.buttons = 'false';
        $dialog.showModal();
      }}
    >
      <Eye />
      <span>See Content</span>
    </button>
  {/if}
  <button
    class="btn hover"
    onclick={() => {
      canOpenNative.set(true);
    }}
  >
    <PencilOff />
    <span>Toggle Native Menu</span>
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

  .context-menu button.btn {
    @apply w-full relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none space-x-1;
    &.hover:hover {
      @apply bg-[#cccccc] text-black;
    }
  }
</style>
