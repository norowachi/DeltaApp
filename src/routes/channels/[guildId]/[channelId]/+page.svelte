<script lang="ts">
  import Message from '$lib/components/app/Message.client.svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { PageProps } from './$types';
  import io, { type Socket } from 'socket.io-client';
  import { writable } from 'svelte/store';
  import { WebSocketOP, type IMessage } from '$lib/interfaces/delta';
  import MessageBox from '$lib/components/app/MessageBox.client.svelte';
  import { afterNavigate, replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { getMessages } from '$lib/api/message';
  import { appContainer, chatBox, messageContainer, messages } from '$lib/store';
  import { sendTauriNotification, showMessageOverlay } from '$lib/api/notification';
  import { listen } from '@tauri-apps/api/event';
  import { getCurrentWindow } from '@tauri-apps/api/window';

  let { data }: PageProps = $props();

  let loading = $state<boolean>(false);
  /**
   * messages current page
   */
  let MessagePages = $state<number>(1);
  let MessageMaxPages = $state<boolean>(false);
  const socket = writable<Socket>();

  let itemId: string | null = page.url.hash?.replace('#', '');

  let showScrollButton = $state<boolean>(false);
  let tempAround = $state<boolean>(false);

  onMount(async () => {
    // load messages
    if (!$messages.length && !itemId && data.messages) {
      messages.set(data.messages.messages);
      MessagePages = data.messages.currentPage;
      MessageMaxPages = data.messages.pages === data.messages.currentPage;
    }

    // connect to the websocket if not connected
    if (!$socket || !$socket.connected)
      socket.set(
        io('wss://api.noro.cc', {
          auth: {
            token: data.token,
          },
        }),
      );

    // register events if not registered
    if ($socket && !$socket.hasListeners('message')) {
      // on connection
      $socket.on('connect', () => {
        console.log('[WS] Connected to the server');
        $socket.emit(
          'join',
          data.channels.map((c) => c.id),
        );
      });

      // heartbeat/ping
      $socket.on('ping', (callback) => {
        // ack ping
        if ($socket.disconnected) callback(null);
        else callback($socket.id);
      });

      // on new messages add to the $messages store
      $socket.on('message', (message) => {
        if (message.op === WebSocketOP.MESSAGE_CREATE) {
          const md: IMessage = message.d;
          if (md.channelId !== data.channel.id) return;
          // TODO: add a way to make messages show with gray text or so if they're still not sent
          messages.update((oldmsgs) => {
            const dupMsg = oldmsgs?.find((msg) => msg.id === md.id);
            return dupMsg
              ? $messages
              : [...($messages || []), md]?.sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
          });
        }
      });

      $socket.on('mention', async (message: IMessage) => {
        const { author, content, guildId, channelId } = message;
        // send a notification if the overlay errored out
        const result = await showMessageOverlay(message);
        if (!result) {
          const largeContent = content.replace(/<@\w+>/g, (match) => match.slice(1, -1)).trim();
          const guild = data.user.guilds.find((g) => g.id === guildId);
          await sendTauriNotification({
            title: author.username,
            body: largeContent.substring(0, 40),
            largeBody: largeContent,
            summary: guild
              ? `${guild.name} (#${guild.channels.find((c) => c.id === channelId)?.name})`
              : author.username,
            extra: {
              guildId,
              channelId,
              type: 'mention',
            },
          });
        }
      });
    }

    // TODO: check if this works/doesnt error on normal browsers
    if ('__TAURI__' in window) {
      // tauri notification click handling
      // #desktop
      listen('open', async (event) => {
        // TODO: do message shiz
        const { messageId, channelId, guildId } = event.payload as any;
        // if we're already in the channel, we don't need to do anything
        if (location.pathname !== `/channels/${guildId}/${channelId}`)
          location.assign(`/channels/${guildId}/${channelId}`);
        const window = getCurrentWindow();
        await window.setFocus();
      });
    }

    // observe chatbox for resizing
    new ResizeObserver(ChatLength).observe($chatBox!);
    // body resize observer
    new ResizeObserver(() => {
      if (
        $messageContainer && // if user scrolled up 2x their viewport or more, don't scroll down
        $messageContainer.scrollHeight - 3 * window.innerHeight <= $messageContainer.scrollTop
      )
        $messageContainer.scrollTo({
          top: $messageContainer.scrollHeight,
          behavior: 'instant',
        });
    }).observe(document.body);

    // on keydown focus chatbox
    document.onkeydown = (e) => {
      if ((e.ctrlKey && e.key !== 'v') || e.altKey) return;
      const target = e.target as HTMLElement;
      if ('value' in target) return;
      $chatBox?.focus();
    };
  });

  // on page url change or so
  afterNavigate((nav) => {
    if (nav.to?.url?.pathname === nav.from?.url?.pathname) return;
    loading = false;
    setTimeout(() => {
      $messageContainer.scrollTo({
        top: $messageContainer.scrollHeight,
        behavior: 'instant',
      });
    }, 0);
    // if we're just entering the page, we don't need to do anything
    if (nav.type === 'enter') return;
    messages.set(data.messages?.messages || []);
    MessagePages = data.messages?.currentPage || 1;
    MessageMaxPages = data.messages?.pages === data.messages?.currentPage || false;
    // TODO: create room joining for the new channel
    // and leaving the old one (missing in backend)
    // for now it's not a big deal as we just join the whole guild's room
  });

  // on disconnect, i think
  onDestroy(() => {
    console.log('[WS] Disconnecting from the server - or at least should');
    // $socket?.disconnect();
  });

  // Auto-scroll on new messages
  $effect(() => {
    console.log($messages.length);
    $messages && $messageContainer;
    if ($messages && $messageContainer) {
      if (itemId) {
        // get around a message if its not in the store
        const msg = $messages.find(({ id }) => itemId === id);
        if (!msg) {
          MessageMaxPages = true;
          tempAround = true;
          showScrollButton = true;
          // load around a message
          getMessages({
            guildId: data.guild.id,
            channelId: data.channel.id,
            around: itemId,
          }).then((res) => (res ? messages.set([...res.messages]) : void 0));
        }

        // if item exists scroll to it
        const element = document.getElementById(itemId!);
        if (element)
          setTimeout(() => {
            element.scrollIntoView({
              behavior: msg ? 'smooth' : 'instant',
              block: 'center',
              inline: 'center',
            });
            element.style.animation = 'color-pulse 2s linear';
            // remove fragments
            replaceState(window.location.pathname, page.state);
            itemId = null;
          }, 100);
        return;
      } else if (tempAround) {
        // container > ul > last element, scroll to it
        $messageContainer.firstElementChild?.lastElementChild?.scrollIntoView({
          inline: 'end',
          block: 'end',
          behavior: 'instant',
        });
        MessageMaxPages = false;
        tempAround = false;
        showScrollButton = false;
        return;
      } else if (
        $messageContainer.scrollHeight - 3 * window.innerHeight <=
        $messageContainer.scrollTop
      )
        // if user scrolled up 2x their viewport or more, don't scroll down
        $messageContainer.scrollTo({
          top: $messageContainer.scrollHeight,
          behavior: 'instant',
        });
    }
  });

  function ChatLength(entries: ResizeObserverEntry[]) {
    const target = entries[0].target as HTMLTextAreaElement;
    if (!$appContainer) return;

    $appContainer.style.height = 'calc(100dvh - 56px - ' + target.clientHeight + 'px)';

    if ($messageContainer) {
      $messageContainer.scrollTo({
        top: $messageContainer.scrollHeight,
        behavior: 'instant',
      });
    }
    return;
  }

  async function onContainerScroll() {
    // if user scrolled up 2x their viewport or more
    if ($messageContainer.scrollHeight - 3 * window.innerHeight > $messageContainer.scrollTop) {
      showScrollButton = true;
    } else if (!tempAround) {
      showScrollButton = false;
    }

    if (
      $messageContainer.scrollTop <= $messageContainer.clientHeight &&
      !loading &&
      $messages.length < data.channel.messages &&
      !MessageMaxPages
    ) {
      loading = true;
      const before = $messages[0].id;
      // get next page
      const result = await getMessages({
        guildId: data.guild.id,
        channelId: data.channel.id,
        before,
      });
      if (result?.messages?.length) {
        messages.update((old) => [...result.messages, ...old]);
        console.log(
          $messages.length,
          result.messages.length,
          data.channel.messages,
          result.messages,
        );
        MessagePages = result.currentPage;
        MessageMaxPages = result.pages === result.currentPage;
        // remove loader if no more pages
        if (MessageMaxPages) {
          $messageContainer.onscroll = null;
        } else {
          $messageContainer.scrollBy({
            top: 75,
          });
        }
      }
      loading = false;
    }
  }
</script>

<main
  bind:this={$appContainer}
  class="flex flex-col-reverse w-full"
  style="height: calc(100dvh - 100px)"
>
  <section
    bind:this={$messageContainer}
    onscroll={onContainerScroll}
    class="w-full overflow-y-auto snap-y snap-mandatory"
  >
    <ul class="snap-normal">
      {#if loading}
        <li class="flex justify-center items-center m-auto mt-2 w-64px">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-32 text-[#ccc] animate-spin fill-[var(--other-background)]"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </li>
      {/if}
      {#each $messages as { id, content, embeds, author, createdAt, ephemeral, mentions }, i (id)}
        <li class="mb-1px {i === $messages.length - 1 ? 'pb-5' : ''}">
          <Message
            {id}
            {content}
            {embeds}
            {author}
            {createdAt}
            {ephemeral}
            {mentions}
            lastMessage={$messages[i - 1]}
          />
        </li>
      {/each}
    </ul>
  </section>

  <!-- button to scroll to bottom -->
  {#if showScrollButton}
    <button
      class="fixed inline-flex justify-end bottom-60px w-full bg-gray-9 hover:bg-gray-8 text-white transition-all duration-300 ease-in px-5"
      onclick={async () => {
        if (!tempAround) {
          $messageContainer.scrollTo({
            top: $messageContainer.scrollHeight,
            behavior: 'smooth',
          });
        } else {
          showScrollButton = false;
          const result = await getMessages({ guildId: data.guild.id, channelId: data.channel.id });
          if (!result) return location.reload();
          messages.set(result.messages);
          MessagePages = result.currentPage;
          MessageMaxPages = result.pages === result.currentPage;
        }
      }}
    >
      {#if tempAround}
        <span class="float-left mr-auto">You are viewing an old conversation</span>
        <span class="mr-24px">Jump to present</span>
      {:else}
        <span class="mr-24px">Jump to bottom</span>
      {/if}
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
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  {/if}
</main>
<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
