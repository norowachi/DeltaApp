<script lang="ts">
	import Message from '$lib/components/app/Message.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from './$types';
	import io, { type Socket } from 'socket.io-client';
	import { writable } from 'svelte/store';
	import { WebSocketOP, type IMessage } from '$lib/interfaces/delta';
	import MessageBox from '$lib/components/app/MessageBox.client.svelte';
	import { afterNavigate } from '$app/navigation';
	import { getMessages } from '$lib/api/message';
	import { Entry } from '$lib/plugins/keyring';
	import { sendTauriNotification, showMessageOverlay } from '$lib/api/notification';
	import { listen } from '@tauri-apps/api/event';
	import { getCurrentWindow } from '@tauri-apps/api/window';

	let { data }: PageProps = $props();

	let app: HTMLElement;
	let messageContainer: HTMLElement;
	let messages = $state<IMessage[]>([]);
	const socket = writable<Socket>();

	onMount(async () => {
		const entry = new Entry('Delta', data.user.id, 'test');
		const secret = await entry.getPassword().catch(() => null);

		console.log(secret);
		if (!secret) {
			await entry.setPassword('also test');
		}

		if (!messages.length)
			getMessages({ guildId: data.guild.id, channelId: data.channel.id })
				.then((data) => {
					messages = data;
				})
				.catch(console.error);

		socket.set(
			io('wss://api.noro.cc', {
				auth: {
					token: data.token,
				},
			}),
		);

		$socket.on('connect', () => {
			console.log('[WS] Connected to the server');
			$socket.emit(
				'join',
				data.channels.map((c) => c.id),
			);
		});

		$socket.on('ping', (callback) => {
			// ack ping
			if ($socket.disconnected) callback(null);
			else callback($socket.id);
		});

		$socket.on('message', (message) => {
			if (message.op === WebSocketOP.MESSAGE_CREATE) {
				const md: IMessage = message.d;
				if (md.channelId !== data.channel.id) return;
				// TODO: add a way to make messages show with gray text or so if they're still not sent
				messages = (
					messages?.find((msg) => msg.id === md.id) ? messages : [...(messages || []), md]
				)?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			}
		});

		$socket.on('mention', async (message: IMessage) => {
			const { author, content, guildId, channelId } = message;
			// send a notification if the overlay errored out
			const result = await showMessageOverlay(message);
			if (!result) {
				const largeContent = content.replace(/<@\w+>/g, (match) => match.slice(1, -1)).trim();
				const guild = data.user.guilds.find((g) => g.id === guildId);
				await sendTauriNotification({
					title: author.username,
					body: largeContent.substring(0, 40),
					largeBody: largeContent,
					summary: guild
						? `${guild.name} (#${guild.channels.find((c) => c.id === channelId)?.name})`
						: author.username,
					extra: {
						guildId,
						channelId,
						type: 'mention',
					},
				});
			}
		});

		const chat = document.getElementById('chat')!;
		new ResizeObserver(ChatLength).observe(chat);
		// body resize observer
		new ResizeObserver(() => {
			if (messageContainer)
				messageContainer.scrollTo({
					top: messageContainer.scrollHeight,
					behavior: 'instant',
				});
		}).observe(document.body);
		document.onkeydown = (e) => {
			if ((e.ctrlKey && e.key !== 'v') || e.altKey) return;
			const target = e.target as HTMLElement;
			if ('value' in target) return;
			chat.focus();
		};
	});

	afterNavigate((nav) => {
		// if we're just entering the page, we don't need to do anything
		if (nav.type === 'enter') return;
		messages = data.messages;
		// TODO: create room joining for the new channel
		// and leaving the old one (missing in backend)
		// for now it's not a big deal as we just join the whole guild's room
	});

	onDestroy(() => {
		console.log('[WS] Disconnecting from the server');
		$socket?.disconnect();
	});

	// Auto-scroll
	$effect(() => {
		messages;
		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
	});

	function ChatLength(entries: ResizeObserverEntry[]) {
		const target = entries[0].target as HTMLTextAreaElement;
		if (!app) return;

		app.style.height = 'calc(100dvh - 56px - ' + target.clientHeight + 'px)';

		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior: 'instant',
			});
		}
		return;
	}

	// tauri notification click handling
	// #desktop
	listen('open', async (event) => {
		// TODO: do message shiz
		const { messageId, channelId, guildId } = event.payload as any;
		// if we're already in the channel, we don't need to do anything
		if (location.pathname !== `/channels/${guildId}/${channelId}`)
			location.assign(`/channels/${guildId}/${channelId}`);
		const window = getCurrentWindow();
		await window.setFocus();
	});
</script>

<main bind:this={app} class="flex flex-col-reverse w-full" style="height: calc(100dvh - 100px)">
	<section bind:this={messageContainer} class="w-full overflow-y-auto snap-y snap-mandatory">
		<ul class="snap-end">
			{#each messages as { id, content, embeds, author, createdAt, mentions }, i (id)}
				<li class="mb-1px {i === messages.length - 1 ? 'pb-5' : ''}">
					<Message
						{id}
						{content}
						{embeds}
						{author}
						{createdAt}
						{mentions}
						lastMessage={messages[i - 1]}
					/>
				</li>
			{/each}
		</ul>
	</section>
</main>
<MessageBox guildId={data.guild.id} channelId={data.channel.id} />
