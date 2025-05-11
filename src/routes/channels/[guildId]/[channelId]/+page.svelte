<script lang="ts">
  import Message from '$lib/components/app/Message.client.svelte';
  import { onMount } from 'svelte';
  import type { PageProps } from './$types';
  import MessageBox from '$lib/components/app/MessageBox.client.svelte';
  import { afterNavigate, replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { getMessages } from '$lib/api/message';
  import { appContainer, chatBox, messageContainer, messageLinking, messages } from '$lib/store';
  import { listen } from '@tauri-apps/api/event';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { isTauri } from '@tauri-apps/api/core';

  let { data }: PageProps = $props();

  let loading = $state<boolean>(false);
  let MessageMaxPages = $state<boolean>(false);

  let showScrollButton = $state<boolean>(false);
  let tempAround = $state<boolean>(false);

  onMount(async () => {
    const hash = page.url.hash?.replace('#', '');
    messageLinking.set(hash);
    // load messages
    if (!$messages.length && data.messages && !hash) {
      messages.set(data.messages.messages);
      MessageMaxPages = data.messages.pages === data.messages.currentPage;
    }

    if (isTauri()) {
      // tauri notification click handling
      // #desktop
      listen('open', async (event) => {
        // TODO: do message shiz
        const { messageId, channelId, guildId } = event.payload as any;
        if (location.pathname !== `/channels/${guildId}/${channelId}`)
          location.assign(`/channels/${guildId}/${channelId}/${messageId}`);
        else messageLinking.set(messageId);

        await getCurrentWindow().setFocus();
      });
    }

    // observe chatbox for resizing
    new ResizeObserver(ChatLength).observe($chatBox!);
    // body resize observer
    new ResizeObserver(() => {
      if (
        $messageContainer && // if user scrolled up 2x their viewport or more, don't scroll down
        $messageContainer.scrollHeight - 3 * window.innerHeight <= $messageContainer.scrollTop
      ) {
        $messageContainer.scrollTo({
          top: $messageContainer.scrollHeight,
          behavior: 'instant',
        });
      }
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
    MessageMaxPages = data.messages?.pages === data.messages?.currentPage || false;
    // TODO: create room joining for the new channel
    // and leaving the old one (missing in backend)
    // for now it's not a big deal as we just join the whole guild's room
  });

  messageLinking.subscribe(async (messageId) => {
    if (!messageId) return;
    // get around a message if its not in the store
    const msg = $messages.find(({ id }) => messageId === id);
    if (!msg || tempAround) {
      // load around a message
      const fetchedMessages = await getMessages({
        guildId: data.guild.id,
        channelId: data.channel.id,
        around: messageId,
      });
      if (!fetchedMessages || fetchedMessages.messages.length <= 0) return;
      else messages.set(fetchedMessages.messages);

      // checks if the fetched message is the last, and if its not then it sets those values to true, as we reached the bottom anyway
      if (
        $messages[$messages.length - 1].id !==
        data.messages.messages[data.messages.messages.length - 1].id
      ) {
        MessageMaxPages = true;
        tempAround = true;
        showScrollButton = true;
      }
    }

    // get element
    const element = document.getElementById(messageId);
    // if element doesnt exist yet or so create an observer
    if (!element) {
      const observer = new MutationObserver(() => {
        const element = document.getElementById(messageId);
        if (element) {
          observer.disconnect();
          messageLinking.set('');
          setTimeout(() => {
            element.scrollIntoView({
              behavior: msg ? 'smooth' : 'instant',
              block: 'center',
              inline: 'center',
            });
            element.style.animation = 'color-pulse 2s linear';
            // remove fragments
            replaceState(location.pathname, page.state);
          }, 100);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } // else just scroll to it
    else {
      messageLinking.set('');
      setTimeout(() => {
        element.scrollIntoView({
          behavior: msg ? 'smooth' : 'instant',
          block: 'center',
          inline: 'center',
        });
        element.style.animation = 'color-pulse 2s linear';
        // remove fragments
        replaceState(location.pathname, page.state);
      }, 100);
    }
  });

  // Auto-scroll on new messages
  $effect(() => {
    $messages && $messageContainer;
    if ($messages && $messageContainer) {
      if (tempAround && !page.url.hash?.replace('#', '')) {
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
      ) {
        // if user scrolled up 2x their viewport or more, don't scroll down
        $messageContainer.scrollTo({
          top: $messageContainer.scrollHeight,
          behavior: 'instant',
        });
      }
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
      class="fixed inline-flex justify-end bottom-60px w-full bg-gray-2 dark:bg-gray-9 hover:bg-gray-3 dark:hover:bg-gray-8 text-black dark:text-white transition-all duration-300 ease-in px-5"
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
