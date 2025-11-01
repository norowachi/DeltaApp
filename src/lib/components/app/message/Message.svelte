<script lang="ts">
  import { chatBox } from '$lib/store.svelte';
  import { error } from '@sveltejs/kit';
  import AstTree from './ASTTree.svelte';
  import parse from './parser/index';
  import UserAvatar from '../UserAvatar.svelte';

  let {
    id,
    content,
    embeds,
    author,
    createdAt,
    ephemeral,
    lastMessage,
  }: Pick<IMessage, 'id' | 'author' | 'createdAt'> &
    Partial<Pick<IMessage, 'content' | 'embeds' | 'ephemeral'>> & {
      lastMessage?: IMessage;
    } = $props();

  const date = new Date(createdAt);

  // if same author and there is a time difference of 10 minutes
  const GroupUp = $derived(
    lastMessage?.author.id === author.id &&
      date.getTime() - new Date(lastMessage.createdAt).getTime() < 600000,
  );

  if (!content && (embeds?.length || 0) === 0) error(400, 'Message missing content and embeds');
  const shortTime = date.toLocaleTimeString(undefined, { timeStyle: 'short' });
  const lastMessageDate = (lastMessage && new Date(lastMessage?.createdAt || 0)) || date;
  const isSameDay = $derived(
    lastMessageDate.getDay() === date.getDay() &&
      lastMessageDate.getMonth() === date.getMonth() &&
      lastMessageDate.getFullYear() === date.getFullYear(),
  );
</script>

{#if !isSameDay}
  <div
    class="w-[calc(100%-2rem)] text-center b-b-1 b-solid border-[var(--other-background)] text-xs mx-1rem my-10px leading-0.1px pointer-none opacity-60"
  >
    <strong class="p-x-10px bg-[var(--background-color)] select-none">
      {date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </strong>
  </div>
{/if}

<!-- TODO: finish ephemeral shiz -->
<div
  {id}
  class="w-full px-1 py-1px transition-colors duration-100 ease-in-out hover:bg-[var(--background-hover)]"
  style={ephemeral ? 'display: none;' : ''}
>
  {#if !GroupUp}
    <div id={author.id} class="w-full flex items-center mx-auto pt-2px">
      <div class="mb--30px">
        <UserAvatar {author} />
      </div>
      <h3 class="ml-10px">
        <button
          onclick={() => {
            $chatBox?.focus();
          }}
          class="text-gray-700 dark:text-gray-200 text-lg font-bold cursor-pointer hover:underline"
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
  <div class="text-wrap break-words ml-50px pr-2 whitespace-pre-line">
    {#if content}
      {#each parse(content) as chunk, i (i)}
        <AstTree parse={chunk} />
      {/each}
    {/if}

    {#if embeds && embeds.length > 0}
      <div class="pb-2 {GroupUp ? 'pt-1' : ''}">
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
