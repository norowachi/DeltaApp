<script lang="ts">
	import { onMount } from 'svelte';
	import { listen } from '@tauri-apps/api/event';
	import Message from '$lib/components/app/Message.client.svelte';
	import type { IMessage } from '$lib/interfaces/delta';
	import { getAllWebviewWindows, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { writable } from 'svelte/store';

	const currentWindow = getCurrentWebviewWindow();
	const message = writable<IMessage>();
	let bar: HTMLDivElement;

	onMount(() => {
		currentWindow.emit('ready');
		listen<IMessage>('message', (event) => {
			message.set(event.payload);
			if (bar) {
				bar.style.animation = 'none';
				setTimeout(() => {
					bar.style.animation = '';
				}, 1);
			}
		});
	});

	message.subscribe(async (value) => {
		if (!value) await getCurrentWebviewWindow().hide();
	});

	async function onclick() {
		if (!message) return;
		const windows = await getAllWebviewWindows();
		windows
			.find((w) => w.label === 'main')
			?.emit('open', {
				messageId: $message.id,
				channelId: $message.channelId,
				guildId: $message.guildId,
			});
		windows.find((w) => w.label === 'message_overlay')?.hide();
	}
</script>

<button class="w-full h-full *:bg-transparent!" {onclick}>
	{#if $message}
		<Message
			id={$message.id}
			content={$message.content}
			embeds={$message.embeds}
			author={$message.author}
			createdAt={$message.createdAt}
			mentions={$message.mentions}
		/>
	{/if}
</button>
<div bind:this={bar} class="progress-bar h-2px bg-blue-500 bottom-0"></div>

<style>
	@keyframes fillProgress {
		to {
			width: 100%;
		}
	}

	.progress-bar {
		width: 0%;
		animation: fillProgress 15s linear forwards;
	}
</style>
