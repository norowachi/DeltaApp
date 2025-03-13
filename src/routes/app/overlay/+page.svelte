<!-- #desktop -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import type { IMessage } from '$lib/interfaces/delta';
  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
  import { writable } from 'svelte/store';
  import { formatContent } from '$lib/api/message';

  const currentWindow = getCurrentWebviewWindow();
  const message = writable<IMessage>();
  let bar: HTMLDivElement;
  let timeout: number;

  onMount(() => {
    currentWindow.emit('ready');
    listen<IMessage>('message', (event) => {
      message.set(event.payload);
      if (!bar) return;
      bar.style.animation = 'none';
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        bar.style.animation = '';
      }, 10);
    });

    listen('tauri://close-requested', () => currentWindow.close());
  });

  message.subscribe(async (value) => {
    if (!value) currentWindow.hide();
  });

  async function onclick() {
    if ($message)
      currentWindow.emitTo('main', 'open', {
        messageId: $message.id,
        channelId: $message.channelId,
        guildId: $message.guildId,
      });
    currentWindow.hide();
    if (bar) bar.style.animation = 'none';
  }

  function message_content() {
    const content = $message?.content?.trim();
    if (!content) return;
    return content.substring(0, 37) + (content.length > 37 ? '...' : '');
  }

  let date = new Date($message?.createdAt || Date.now());
  let shortTime = date.toLocaleTimeString(undefined, { timeStyle: 'short' });
</script>

<button class="w-full h-full *:bg-transparent!" {onclick}>
  {#if $message}
    <div class="w-full inline-flex items-center mx-auto pt-1">
      <img
        src={$message.author.avatar || 'https://api.noro.cc/images/delta-0.png'}
        alt={$message.author.username}
        height="40"
        width="40"
        class="rounded-full select-none max-w-40px max-h-40px"
        loading="lazy"
      />
      <h3 class="ml-10px">
        <span class="text-gray-200 text-lg cursor-pointer hover:underline"
          >{$message.author.username}</span
        >
        <time class="text-gray-600 dark:text-gray-400 text-xs pointer-events-none">
          {date.toDateString()}
          {shortTime}
        </time>
      </h3>
    </div>

    <div class="px-2px">
      {#each formatContent(message_content()) as chunk, i (i)}
        {#if $message.mentions && Object.values($message.mentions).includes(chunk.slice(2, -1))}
          <span
            class="bg-purple-500 hover:bg-purple-700 text-dark rounded-md cursor-pointer transition-colors duration-300 px-4px py-2px"
          >
            {chunk.replace(/<|>/g, '')}
          </span>
        {:else}
          {(new RegExp('^\s+').test(chunk) ? '\s' : '') + chunk.trim()}
        {/if}
      {/each}
    </div>
  {/if}
</button>
<div bind:this={bar} class="progress-bar h-2px bg-blue-500 bottom-0" style="animation: none;"></div>

<style>
  @keyframes fillProgress {
    to {
      width: 100%;
    }
  }

  .progress-bar {
    width: 0%;
    animation: fillProgress 15s linear forwards;
  }
</style>
