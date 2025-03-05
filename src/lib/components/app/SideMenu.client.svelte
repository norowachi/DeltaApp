<script lang="ts">
	import type { IChannel, IGuild } from '$lib/interfaces/delta';
	import { writable } from 'svelte/store';

	const {
		channel,
		guild,
		channels,
	}: {
		channel: Pick<IChannel, 'id' | 'name' | 'type'>;
		guild: Pick<IGuild, 'id' | 'name' | 'members' | 'ownerId' | 'icon'>;
		channels: Pick<IChannel, 'id' | 'name' | 'type'>[];
	} = $props();

	let menu = writable<HTMLElement>();

	// on click, if its not in the menu, close the menu
	document.addEventListener('click', (e) => {
		if (!$menu || (e.target as HTMLElement).ariaLabel === 'menu-button') return;
		if (!$menu.contains(e.target as Node)) $menu.dataset.open = 'false';
	});
</script>

<section class="relative w-full bg-gray-7 max-h-40px m-0">
	<div>
		<!-- TODO: change this ugly format -->
		<span class="text-lg float-left py-1.5 px-2">#{channel.name} @ {guild.name}</span>
		<button
			aria-label="menu-button"
			title="Toggle Menu"
			class="mr-2 p-2 float-right"
			onclick={() => {
				if ($menu) $menu.dataset.open = $menu.dataset.open === 'true' ? 'false' : 'true';
			}}
		>
			☰
		</button>
	</div>

	<div
		bind:this={$menu}
		data-open={$menu?.dataset.open || 'false'}
		class="fixed top-0 right-0 h-full w-64 bg-gray-8 transition-transform duration-300 z-999999"
	>
		<div class="pl-4 pr-2 flex justify-between items-center">
			<h2 class="p-2 text-lg">{guild.name}</h2>
			<button
				title="Close Menu"
				class="p-2"
				onclick={() => {
					if ($menu) $menu.dataset.open = 'false';
				}}
			>
				✖
			</button>
		</div>
		<nav class="*:w-full text-start space-y-1">
			{#each channels as { id, name } (id)}
				<a
					href={`/channels/${guild.id}/${id}`}
					class="block px-2 py-1 hover:bg-gray-9 text-cyan rounded-md {id === channel.id && 'active'}"
				>
					{name}
				</a>
			{/each}
		</nav>
	</div>
</section>

<style lang="postcss">
	[data-open='true'] {
		transform: translateX(0);
	}

	[data-open='false'] {
		transform: translateX(100%);
	}

	a.active {
		background-color: #4a5568;
		color: lime;
		pointer-events: none;
	}
</style>
