<script lang="ts">
  import { onMount } from 'svelte';
  import { NSFWClient } from '$lib/api/nsfw/nsfw.client';
  import { fileToImageData } from '$lib/api/nsfw/utils';

  let worker: NSFWClient;
  let preview: string | null = null;
  let scanning = false;
  let ready = false;
  let result: string | null = null;

  onMount(() => {
    worker = new NSFWClient();

    worker.onResult = (predictions) => {
      scanning = false;

      const porn = predictions.find((p) => p.className === 'Porn')?.probability ?? 0;
      const hentai = predictions.find((p) => p.className === 'Hentai')?.probability ?? 0;
      const sexy = predictions.find((p) => p.className === 'Sexy')?.probability ?? 0;

      const score = porn + hentai + sexy;

      result = score > 0.7 ? 'NSFW ❌ Blocked' : 'Safe ✅';
    };

    const checkReady = setInterval(() => {
      if (worker.ready) {
        ready = true;
        clearInterval(checkReady);
      }
    }, 100);
  });

  async function handleFile(file: File) {
    preview = URL.createObjectURL(file);
    result = null;
    scanning = true;

    const imageData = await fileToImageData(file);
    worker.scan(imageData);
  }
</script>

<div class="scanner">
  <h2>Image Scanner</h2>

  {#if !ready}
    <p>Loading AI model...</p>
  {/if}

  <input
    type="file"
    accept="image/*"
    disabled={!ready}
    on:change={(e) => {
      const file = e.currentTarget.files?.item(0);
      if (file) handleFile(file);
    }}
  />

  {#if preview}
    <img src={preview} alt="preview" class="preview" />
  {/if}

  {#if scanning}
    <p>Scanning...</p>
  {/if}

  {#if result}
    <p class="result">{result}</p>
  {/if}
</div>
