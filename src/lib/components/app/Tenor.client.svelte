<script lang="ts">
	import type { IEmbed } from '$lib/interfaces/delta';
	import type {
		CATEGORY_OBJECT,
		CategoryResponse,
		GIF_OBJECT,
		SearchResponse,
	} from '$lib/interfaces/tenor';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { guildId, channelId } = $props();

	let loader = $state<HTMLSpanElement>();
	const query = writable<string | undefined>();
	const next = writable<string | undefined>();
	const gifs = writable<GIF_OBJECT[]>([]);
	const categories = writable<CATEGORY_OBJECT[]>([]);
	let controller = writable<AbortController>();

	async function getTenorGifs(input_next?: string) {
		if ($gifs.length >= 100) return;
		let body = {
			query: $query,
			next: input_next,
		};

		const res = await fetch('/api/tenor', {
			method: 'POST',
			body: JSON.stringify(body),
		});
		const data: SearchResponse = await res.json();
		let filteredResults: GIF_OBJECT[] = [];
		if (input_next)
			filteredResults = data.results.filter(
				({ id: newId }) => !$gifs.find(({ id: oldId }) => oldId === newId),
			);

		gifs.update((old) => (input_next ? [...old, ...filteredResults] : data.results));
		next.set(data.next);
		return;
	}

	async function OnClickSendGifEmbed({
		url,
		width,
		height,
	}: {
		url: string;
		width: number;
		height: number;
	}) {
		const embed: Partial<IEmbed> = {
			type: 'image',
			image: {
				url,
				width,
				height,
			},
		};

		await fetch(`/api/message/${guildId}/${channelId}`, {
			method: 'POST',
			body: JSON.stringify({
				embeds: [embed],
			}),
		});

		return;
	}

	onMount(() => {
		query.subscribe(async (value) => {
			if (!value || value.length < 3) return gifs.set([]);
			// timeout for the user to finish typing
			await new Promise((r) => setTimeout(r, 1200));
			// if the value is the same as the current query
			if (value && value === $query) {
				// resets the gifs to show the skeleton
				gifs.set([]);
				await getTenorGifs();
			}
			return;
		});

		fetch('/api/tenor')
			.then((res) => res.json().then((data: CategoryResponse) => categories.set(data.tags)))
			.catch(console.error);

		// abort old controller and reset a new one
		const NewController = new AbortController();
		if ($controller) $controller.abort();
		controller.set(NewController);

		document.addEventListener(
			'click',
			(e) => {
				const tab = document.getElementById('gifs-tab') as HTMLDivElement;
				if (!tab) return;
				const target = e.target as HTMLElement;
				if (target.id === 'gif' && target.tagName === 'IMG') {
					const img = target as HTMLImageElement;
					const gif = $gifs.find(({ media_formats }) => media_formats.tinygif.url === img.src);
					if (!gif) return;
					OnClickSendGifEmbed({
						url: gif.media_formats.gif.url,
						width: gif.media_formats.gif.dims[0] ?? 0,
						height: gif.media_formats.gif.dims[1] ?? 0,
					});
					gifs.set([]);
					query.set(undefined);
					next.set(undefined);
					tab.style.display = 'none';
					return;
				}
				// ignore the attach button, which is the caller
				if ([target.ariaLabel, document.activeElement?.ariaLabel].includes('Attach')) return;
				// if the click is within the tab
				if (tab.contains(target)) return;

				if (tab.style.display !== 'none') {
					gifs.set([]);
					query.set(undefined);
					next.set(undefined);
					tab.style.display = 'none';
				}
				return;
			},
			{ signal: NewController.signal },
		);
	});

	$effect(() => {
		if (loader)
			new IntersectionObserver(
				async (entries) => {
					if (entries[0].isIntersecting && entries[0].time > 1000) {
						if ($next) await getTenorGifs($next);
					}
					return;
				},
				{
					rootMargin: '220px',
				},
			).observe(loader);
	});

	onDestroy(() => $controller?.abort());
</script>

<div class="flex flex-col overflow-hidden w-full h-full">
	<input
		type="text"
		placeholder="Search for a gif"
		class="sticky w-full border-3 border-gray-7 p-2 text-white placeholder-gray-8 rounded-lg rounded-b-0 focus:outline-none bg-gradient-to-b from-white to-gray-7 focus:from-cyan focus:to-gray-7"
		maxlength="50"
		bind:value={$query}
	/>
	<div class="bg-gray-7 overflow-y-scroll rounded-lg rounded-t-0 rounded-b-0 h-100dvh">
		<div class="w-xs md:w-md lg:w-lg grid grid-auto-rows-auto cols-2 p-1 gap-1 lg:p-2 lg:gap-2">
			{#if $query && !$gifs?.length}
				{#each Array.from({ length: 10 }), i (i)}
					<div class="h-128px lg:h-167px bg-gray-8 rounded-md animate-pulse"></div>
				{/each}
			{:else if !$gifs?.length}
				{#each $categories as category (category.name)}
					<div class="relative w-full h-128px lg:h-167px cursor-pointer">
						<img
							src={category.image}
							alt={category.name}
							class="w-full h-full rounded-md"
							loading="lazy"
						/>
						<div
							class="w-full absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl rounded-md"
						>
							{category.name}
						</div>
					</div>
				{/each}
			{:else}
				{#each $gifs as gif (gif.id)}
					<img
						id="gif"
						src={gif.media_formats.tinygif.url}
						alt={gif.id}
						class="w-full rounded-md cursor-pointer"
						loading="lazy"
					/>
				{/each}
				<span bind:this={loader} id="gifs-end"></span>
			{/if}
		</div>
	</div>
</div>
