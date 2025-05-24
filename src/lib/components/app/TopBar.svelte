<script lang="ts">
  import functions from '$lib/api/tauri';
  import { registerEvents } from './menus/functions.svelte';
  import { heights, membersmenu, sidemenu } from '$lib/store.svelte';
  import { onMount } from 'svelte';
  import type { IChannel, IGuild } from '$lib/types/delta';
  import { Download, Menu, UsersRound } from '@lucide/svelte';

  const {
    channel,
    guild,
  }: {
    channel: Pick<IChannel, 'id' | 'name' | 'type'>;
    guild: Pick<IGuild, 'id' | 'name' | 'members' | 'ownerId' | 'icon'>;
    channels: Pick<IChannel, 'id' | 'name' | 'type'>[];
  } = $props();

  let updateAvailable = $state<boolean>();

  onMount(async () => {
    // mostly a check for development, but who knows if it'll be useful in the future for prod
    if ($sidemenu?.dataset.pinned !== 'true') registerEvents();

    // TODO: check if update is REQUIRED and if so just download/install it
    if (updateAvailable === undefined) updateAvailable = await functions.checkForUpdate();
  });

  async function updateAndDownload() {
    updateAvailable = false;
    alert('Downloading update...');
    functions.update();
  }
</script>

<div bind:clientHeight={heights[0]} class="relative w-full bg-white dark:bg-#1F1F1F max-h-40px m-0">
  <!-- TODO: change this ugly format -->
  <span class="text-lg float-right py-1.5 px-2">{guild.name} #{channel.name}</span>
  <button
    aria-label="membersmenu-button"
    title="Show Members"
    class="p-2 float-right"
    onclick={() => {
      if ($membersmenu)
        $membersmenu.dataset.open = $membersmenu.dataset.open === 'true' ? 'false' : 'true';
    }}
  >
    <UsersRound class="pointer-events-none" />
  </button>
  <button
    aria-label="sidemenu-button"
    title="Toggle Menu"
    class="ml-2 p-2 float-left"
    onclick={() => {
      if ($sidemenu) $sidemenu.dataset.open = $sidemenu.dataset.open === 'true' ? 'false' : 'true';
    }}
  >
    <Menu class="pointer-events-none" />
  </button>
  {#if updateAvailable}
    <button title="Update" class="p-2 float-right" onclick={updateAndDownload}>
      <Download color="rgb(71, 152, 71)" />
    </button>
  {/if}
</div>
