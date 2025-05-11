<script lang="ts">
  import SideMenu from '$lib/components/app/SideMenu.client.svelte';
  import ContextMenu from '$lib/components/ContextMenu.client.svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { LayoutProps } from './$types';
  import { sendTauriNotification, showMessageOverlay } from '$lib/api/notification';
  import { currentUser, messages, sidemenu, theme } from '$lib/store';
  import { io, type Socket } from 'socket.io-client';
  import { writable } from 'svelte/store';
  import { WebSocketOP, type IMessage } from '$lib/types/delta';
  // registering highlight languages
  import hljs from 'highlight.js';
  import svelte from 'highlight.svelte';

  hljs.registerLanguage('svelte', svelte);
  // end registering

  let { children, data }: LayoutProps = $props();
  const socket = writable<Socket>();

  theme.subscribe(async (theme) => {
    if (theme === 'light') {
      await import('highlight.js/styles/github.css');
    } else {
      await import('highlight.js/styles/github-dark.css');
    }
  });

  onMount(async () => {
    // connect to the websocket if not connected
    if (!$socket || !$socket.connected)
      socket.set(
        io('wss://api.noro.cc', {
          auth: {
            token: data.token,
          },
        }),
      );

    // register events if not registered
    if ($socket && !$socket.hasListeners('message')) {
      // on connection
      $socket.on('connect', () => {
        console.log('[WS] Connected to the server');
        $socket.emit(
          'join',
          data.channels.map((c) => c.id),
        );
      });

      // heartbeat/ping
      $socket.on('ping', (callback) => {
        // ack ping
        if ($socket.disconnected) callback(null);
        else callback($socket.id);
      });

      // on new messages add to the $messages store
      $socket.on('message', (message) => {
        if (message.op === WebSocketOP.MESSAGE_CREATE) {
          const md: IMessage = message.d;
          if (md.channelId !== data.channel.id) return;
          // TODO: add a way to make messages show with gray text or so if they're still not sent
          messages.update((oldmsgs) => {
            const dupMsg = oldmsgs?.find((msg) => msg.id === md.id);
            return dupMsg
              ? $messages
              : [...($messages || []), md]?.sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
          });
        }
      });

      $socket.on('mention', async (message: IMessage) => {
        const { author, content, guildId, channelId } = message;
        // send a notification if the overlay errored out
        const result = await showMessageOverlay(message);
        if (!result) {
          const largeContent = content.replace(/<@\w+>/g, (match) => match.slice(1, -1)).trim();
          const guild = $currentUser.guilds.find((g) => g.id === guildId);
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
    }
  });

  onDestroy(() => {
    console.log('[WS] Destroying socket');
    $socket?.disconnect();
  });

  const MainSideMenuPinned = $derived(
    (!!($sidemenu?.dataset.pinned === 'true') && $sidemenu?.clientWidth) || false,
  );
</script>

<SideMenu channel={data.channel} guild={data.guild} channels={data.channels} />
<div
  style="width: calc(100dvw - {MainSideMenuPinned ||
    0}px); transform: translateX({MainSideMenuPinned || 0}px);"
>
  {@render children()}
</div>
<ContextMenu />
