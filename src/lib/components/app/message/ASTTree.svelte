<script lang="ts">
  import type { IMessage } from '$lib/types/delta';
  import ASTTree from './ASTTree.svelte';
  import Code from './content/Code.svelte';
  import User from './content/User.svelte';

  const {
    parse,
    mentions,
  }: Pick<IMessage, 'mentions'> & { parse: { type: string } & Record<string, unknown> } = $props();
</script>

{#if parse.type === 'text'}
  {parse.content}
{:else if parse.type === 'blockQuote'}
  <blockquote class="border-l-3px border-solid border-#bdc4de pl-1">
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </blockquote>
{:else if parse.type === 'inlineCode'}
  <code class="bg-#1c1d23 text-#bdc4de rounded-md p-2px b-solid">
    {parse.content}
  </code>
{:else if parse.type === 'br'}
  <br />
{:else if parse.type === 'subtext'}
  <span class="text-#bdc4de text-sm">
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
    <br />
  </span>
{:else if parse.type === 'heading'}
  {#if parse.level === 1}
    <h1 class="text-2xl font-bold">
      {#each parse.content as (typeof parse)[] as p}
        {@const subParse = p as typeof parse}
        <ASTTree parse={subParse} {mentions} />
      {/each}
    </h1>
  {:else if parse.level === 2}
    <h2 class="text-xl font-bold">
      {#each parse.content as (typeof parse)[] as p}
        {@const subParse = p as typeof parse}
        <ASTTree parse={subParse} {mentions} />
      {/each}
    </h2>
  {:else if parse.level === 3}
    <h3 class="text-lg font-bold">
      {#each parse.content as (typeof parse)[] as p}
        {@const subParse = p as typeof parse}
        <ASTTree parse={subParse} {mentions} />
      {/each}
    </h3>
  {/if}
{:else if parse.type === 'codeBlock'}
  <Code {parse} />
{:else if parse.type === 'strong'}
  <strong>
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </strong>
{:else if parse.type === 'em'}
  <em class="italic">
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </em>
{:else if parse.type === 'underline'}
  <u>
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </u>
{:else if parse.type === 'strikethrough'}
  <s>
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </s>
{:else if parse.type === 'spoiler'}
  <span class="p-1 blur-4 hover:blur-0 transition-all duration-100 ease-in-out">
    {#each parse.content as (typeof parse)[] as p}
      {@const subParse = p as typeof parse}
      <ASTTree parse={subParse} {mentions} />
    {/each}
  </span>
{:else if parse.type === 'link' || parse.type === "url" || parse.type === "autolink"}
  <a href={parse.target as string} title={parse.title as string} class="text-blue">
    {(parse.content as (typeof parse)[])[0].content}
  </a>
{:else if parse.type === 'user'}
  <span class="whitespace-nowrap inline-block"><User id={parse.id as string} {mentions} /></span>
  <!-- TODO -->
  <!-- {:else if parse.type === 'channel'}
  <span class="whitespace-nowrap inline-block"><Channel id={parse.id as string} /></span>
{:else if parse.type === 'role'}
  <span class="whitespace-nowrap inline-block"><Role id={parse.id as string} /></span> -->
{:else if parse.type === 'everyone'}
  <span class="whitespace-nowrap inline-block mention mx-1 px-1">@everyone</span>
{:else if parse.type === 'here'}
  <span class="whitespace-nowrap inline-block mention mx-1 px-1">@here</span>
{:else}
  <span class="text-danger">Unhandled {parse.type}</span>
{/if}
