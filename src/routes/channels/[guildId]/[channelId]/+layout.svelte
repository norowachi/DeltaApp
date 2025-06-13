<script lang="ts">
  import SideMenu from '$lib/components/app/menus/SideMenu.svelte';
  import ContextMenu from '$lib/components/app/menus/ContextMenu.svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { LayoutProps } from './$types';
  import { sendTauriNotification, showMessageOverlay } from '$lib/api/notification';
  import { appearance, currentUser, messages, sidemenu, theme } from '$lib/store.svelte';
  import { io, type Socket } from 'socket.io-client';
  import { writable } from 'svelte/store';
  // registering highlight languages
  import hljs from 'highlight.js';
  import svelte from 'highlight.svelte';
  import TopBar from '$lib/components/app/TopBar.svelte';
  import MembersMenu from '$lib/components/app/menus/MembersMenu.svelte';
  import { WebSocketOP } from '$lib/types/values';

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
        // channel checks ig
        // if channelId is provided and it doesn't match the current channelId, ignore
        if (message.d.channelId && message.d.channelId !== data.channel.id) return;

        // add message to store
        if (message.op === WebSocketOP.MESSAGE_CREATE) {
          const md: IMessage = message.d;
          // TODO: add a way to make messages show with gray text or so if they're still not sent
          messages.update((oldmsgs) => {
            const dupMsg = oldmsgs?.find((msg) => msg.id === md.id);
            return dupMsg
              ? $messages
              : [...($messages || []), md]?.sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
          });
        } else if (message.op === WebSocketOP.MESSAGE_DELETE) {
          // delete message from store
          const md: Pick<IMessage, 'id'> = message.d;
          messages.update((oldmsgs) => {
            return oldmsgs?.filter((msg) => msg.id !== md.id);
          });
        } else if (message.op === WebSocketOP.MESSAGE_UPDATE) {
          // update the message in the store
          const md: IMessage = message.d;
          messages.update((oldmsgs) => {
            return oldmsgs?.map((msg) => (msg.id === md.id ? md : msg));
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

  const MainSideMenuPinned = $derived(($appearance?.sideMenuPinned && $sidemenu?.clientWidth) || 0);
</script>

<TopBar {...data} />
<MembersMenu {...data} />
<SideMenu {...data} />
<div
  style="width: calc(100dvw - {MainSideMenuPinned}px); transform: translateX({MainSideMenuPinned}px);"
>
  {@render children()}
</div>
<ContextMenu />
