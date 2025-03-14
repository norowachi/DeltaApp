<script lang="ts">
  import SideMenu from '$lib/components/app/SideMenu.client.svelte';
  import ContextMenu from '$lib/components/ContextMenu.client.svelte';
  import { listen } from '@tauri-apps/api/event';
  import '../../../../app.css';
  import type { LayoutProps } from './$types';
  import { ask } from '@tauri-apps/plugin-dialog';
  import { check } from '@tauri-apps/plugin-updater';
  import { relaunch } from '@tauri-apps/plugin-process';

  let { children, data }: LayoutProps = $props();

  listen('update-downloaded', () => {
    console.log('update downloaded');
    ask(
      'An update has been downloaded, would you like to install it and restart the app?',
      'Update downloaded!',
    ).then(async (res) => {
      if (res) {
        const update = await check();
        if (update) {
          await update.install();
          await relaunch();
        }
      }
    });
  });
</script>

<SideMenu channel={data.channel} guild={data.guild} channels={data.channels} />
{@render children()}
<ContextMenu />
