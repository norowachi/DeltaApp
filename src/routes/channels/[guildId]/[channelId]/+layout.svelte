<script lang="ts">
  import SideMenu from '$lib/components/app/SideMenu.client.svelte';
  import ContextMenu from '$lib/components/ContextMenu.client.svelte';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
</script>

<SideMenu channel={data.channel} guild={data.guild} channels={data.channels} />
{@render children()}
<ContextMenu />
