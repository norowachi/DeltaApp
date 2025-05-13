<script lang="ts">
  import Tenor from './Tenor.client.svelte';
  import { sendMessage } from '$lib/api/message';
  import { chatBox, draft } from '$lib/store';

  let { guildId, channelId } = $props();

  draft.subscribe((value) => {
    if (value?.trim().length === 0) draft.set('');
  });

  // send message
  async function OnClickSend() {
    if (!$chatBox) return;
    const message = $draft?.trim();
    if (!message) return;
    draft.set('');

    await sendMessage({
      content: message,
      guildId,
      channelId,
    });

    return;
  }

  // handle GIF tab click
  async function OnClickGifsTab() {
    const tab = document.getElementById('gifs-tab');
    if (!tab) return;

    if (tab.style.display === 'none') {
      tab.style.display = 'block';
      await new Promise((r) => setTimeout(r, 1));
      tab?.querySelector('input')?.focus();
    } else tab.style.display = 'none';
  }

  // rules list
  const rules = [
    // { regex: /#/g, className: 'hashtag' },
    { regex: /@[^\s@]+/g, className: 'mention' },
  ];

  // escape HTML ig
  function escapeHtml(str: string) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  // Highlight text based on rules
  function highlight(text: any) {
    let escaped = escapeHtml(text);

    rules
      .filter(({ regex }) => regex.test(escaped))
      .forEach((rule) => {
        escaped = escaped.replace(rule.regex, (match) => {
          return `<span class="${rule.className}" spellcheck="false">${match}</span>`;
        });
      });

    return escaped;
  }
</script>

<div
  class="overflow-hidden w-full inline-flex items-center py-2 px-3 bg-gray-50 dark:bg-#1F1F1F rounded-0 bottom-0"
>
  <button
    type="button"
    title="Attach Image"
    class="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
    aria-label="Attach"
    onclick={OnClickGifsTab}
  >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
  <div
    id="gifs-tab"
    class="absolute h-lg max-h-[calc(100dvh-60px)] bottom-60px overflow-y-auto snap-y snap-proximity"
    style="display: none;"
  >
    <Tenor {guildId} {channelId} />
  </div>
  <button
    type="button"
    title="Emojis"
    class="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
    aria-label="Emoji"
  >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
        clip-rule="evenodd"
      ></path>
    </svg>
  </button>
  <div
    role="textbox"
    contenteditable="true"
    tabindex="0"
    bind:this={$chatBox}
    class="block mx-4 whitespace-pre-wrap p-2.5 max-h-300px w-full overflow-y-scroll resize-none text-gray-900 bg-white rounded-lg border-gray-300 dark:text-gray-100 dark:bg-#606060 outline-none ring-red focus:ring-2"
    placeholder="Your Message..."
    data-empty={!$draft}
    spellcheck="true"
    style="height: auto;"
    bind:innerText={$draft}
    oninput={(e) => {
      // TODO : Show a select menu above the chatbox for mentions
      // e.currentTarget.innerHTML = highlight($draft);

      // const sel = window.getSelection();
      // if (sel) {
      //   const range = document.createRange();
      //   range.selectNodeContents(e.currentTarget);
      //   range.collapse(false);
      //   sel.removeAllRanges();
      //   sel.addRange(range);
      // }
    }}
    onkeydown={(e) => {
      if ('virtualKeyboard' in navigator) return e.preventDefault();
      //if (!e.shiftKey && e.key === 'Enter') {
      //  e.preventDefault();
      //  OnClickSend();
      //}
      return;
    }}
  ></div>
  <button
    type="button"
    title="Send"
    onclick={(e) => {
      e.preventDefault();
      OnClickSend();
      $chatBox?.focus();
    }}
    class="inline-flex justify-center p-2 text-blue-500 cursor-pointer"
    aria-label="Send"
  >
    <svg
      class="w-6 h-6 rotate-90"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
      />
    </svg>
  </button>
</div>

<style type="postcss">
  div[contenteditable='true'][data-empty='true']:before {
    position: absolute;
    content: attr(placeholder);
    color: #aaa;
    pointer-events: none;
  }

  :global .mention {
    text-shadow: 1px -1px 0 rgba(255, 56, 255, 0.5);
    color: rgb(255, 60, 197);
    white-space: nowrap;
  }
</style>
