<script lang="ts">
  import hljs from 'highlight.js';

  const { parse }: { parse: Record<string, unknown> } = $props();

  const language = (parse.lang || 'plaintext') as string;
  const code = (parse.content || '') as string;

  const result = hljs.autoDetection(language)
    ? hljs.highlight(code, {
        language,
      })
    : hljs.highlightAuto(code);

  console.log('Code', parse);
</script>

<pre><code>{@html result.value.trim()}</code></pre>

<style lang="postcss">
  pre {
    border: 1 solid gray;
    background: var(--higher-color);
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
    font-family: monospace;
    & code {
      white-space: pre-wrap;
    }
  }
</style>
