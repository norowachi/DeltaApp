<script lang="ts">
  import { formatContent } from '$lib/api/message';
  import type { IMessage } from '$lib/interfaces/delta';
  import { chatBox, draft } from '$lib/store';
  import { error } from '@sveltejs/kit';

  let {
    id,
    content,
    embeds,
    author,
    createdAt,
    ephemeral,
    mentions,
    lastMessage,
  }: Pick<IMessage, 'id' | 'author' | 'createdAt'> &
    Partial<Pick<IMessage, 'content' | 'embeds' | 'mentions' | 'ephemeral'>> & {
      lastMessage?: IMessage;
    } = $props();
  const date = new Date(createdAt);
  // if same author and there is a time difference of 10 minutes
  const GroupUp =
    lastMessage?.author.id === author.id &&
    date.getTime() - new Date(lastMessage.createdAt).getTime() < 600000;
  if (!content && (embeds?.length || 0) === 0) error(400, 'Message missing content and embeds');
  const shortTime = date.toLocaleTimeString(undefined, { timeStyle: 'short' });
</script>

<!-- TODO: finish ephemeral shiz -->
<div
  {id}
  class="w-full px-2 rounded-md transition-colors duration-100 ease-in-out hover:bg-[var(--background-hover)]"
  style={ephemeral ? 'display: none;' : ''}
>
  {#if !GroupUp}
    <div class="w-full inline-flex items-center mx-auto pt-1">
      <img
        src={author.avatar || 'https://api.noro.cc/images/delta-0.png'}
        alt={author.username}
        height="40"
        width="40"
        class="rounded-full select-none max-w-40px max-h-40px"
        loading="lazy"
        onerror={(e) =>
          ((e.currentTarget as HTMLImageElement).src = 'https://api.noro.cc/images/delta-0.png')}
      />
      <h3 class="ml-10px">
        <button
          onclick={() => {
            $chatBox?.focus();
            draft.update((d) => (d ? d + '' : '') + `<@${author.username}>`);
          }}
          class="text-gray-700 dark:text-gray-200 text-lg cursor-pointer hover:underline"
        >
          {author.username}
        </button>
        <time class="text-gray-400 dark:text-gray-400 text-xs pointer-events-none">
          {date.toDateString()}
          {shortTime}
        </time>
      </h3>
    </div>
  {/if}

  <!-- til i figure a way to format it -->
  <!-- {#if GroupUp}
		<time class="ml-0 text-[var(--other-background)] text-xs">
			{shortTime}
		</time>
	{/if} -->

  {#if content}
    <div class="text-wrap break-words px-2 whitespace-pre-line">
      {#each formatContent(content.trim()) as chunk, i (i)}
        {#if mentions && Object.values(mentions).includes(chunk.slice(2, -1))}
          <span
            class="bg-purple-500 hover:bg-purple-700 text-dark rounded-md cursor-pointer transition-colors duration-300 px-4px py-2px"
          >
            {chunk.replace(/<|>/g, '')}
          </span>
        {:else}
          {chunk}
        {/if}
      {/each}
    </div>
  {/if}

  {#if embeds && embeds.length > 0}
    <div class="px-2 pb-2 {GroupUp ? 'pt-1' : ''}">
      {#each embeds as embed}
        {#if embed.type === 'image'}
          <img
            src={embed.image!.url}
            alt={embed.image!.url}
            width={embed.image!.width}
            height={embed.image!.height}
            class="rounded-md max-w-90% pointer-events-none"
            loading="lazy"
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<!-- <style lang="postcss">
	div > time {
		visibility: hidden;
		font-size: 0.75rem;
	}

	div:hover > time {
		visibility: visible;
	}
</style> -->
