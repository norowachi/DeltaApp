<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let menu = writable<HTMLElement>();
	let opened = writable<boolean>(false);
	let canOpenNative = writable<boolean>(false);
	let controller = writable<AbortController>();

	onMount(() => HandleTheme(false));

	function HandleTheme(toggle = true) {
		// get old theme
		let oldOption = localStorage.getItem('theme');
		if (!oldOption) {
			oldOption = window.matchMedia(`(prefers-color-scheme: dark)`).matches ? 'dark' : 'light';
			localStorage.setItem('theme', oldOption);
		}
		// init new theme
		let newOption;
		// if its a toggle
		if (toggle) {
			// switch themes and save
			newOption = oldOption === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', newOption);
		}
		// toggle the "dark" class
		document.body.classList.toggle('dark', newOption === 'dark' || (!toggle && oldOption === 'dark'));
		// toggle the "light" class
		document.body.classList.toggle(
			'light',
			newOption === 'light' || (!toggle && oldOption === 'light'),
		);
	}

	menu.subscribe((menu) => {
		if (!menu) return;

		// abort old controller and reset a new one
		const NewController = new AbortController();
		if ($controller) $controller.abort();
		controller.set(NewController);

		// hide menu if its open
		document.addEventListener(
			'click',
			() => {
				opened.set(false);
				canOpenNative.set(false);
			},
			{ signal: NewController.signal },
		);
		document.addEventListener('auxclick', () => opened.set(false), { signal: NewController.signal });
		// open the context menu
		document.addEventListener('contextmenu', rightClick, { signal: NewController.signal });

		function rightClick(e: MouseEvent) {
			if ($canOpenNative || !menu) {
				opened.set(false);
				canOpenNative.set(false);
				return;
			}

			e.preventDefault();

			// Calculate the dimensions of the menu
			//? Displaying it since `display: none` elements return 0
			menu.style.display = 'block';
			const menuWidth = menu.clientWidth;
			const menuHeight = menu.clientHeight;
			menu.style.display = '';

			// Determine position for the menu
			let posX = e.pageX;
			let posY = e.pageY;

			// Check if the menu goes beyond the right edge of the window
			if (posX + menuWidth > window.innerWidth) {
				posX = window.innerWidth - menuWidth;
			}

			// Check if the menu goes beyond the bottom edge of the window
			if (posY + menuHeight > window.innerHeight) {
				posY = window.innerHeight - menuHeight;
			}

			// Set the position of the menu
			menu.style.left = posX + 'px';
			menu.style.top = posY + 'px';

			// show menu
			opened.set(true);
			canOpenNative.set(true);
		}
	});

	onDestroy(() => $controller?.abort());
</script>

<div
	bind:this={$menu}
	data-open={$opened}
	class="absolute data-[open=false]:hidden data-[open=true]:block rounded-md border p-1 animation bg-gray-6 text-white border-black dark:border-white"
>
	<ul class="flex flex-col rounded-md shadow-xl overflow-hidden">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<li
			onclick={() => HandleTheme(true)}
			class="context-menu-item hover:bg-[var(--other-background)]"
		>
			<img src="/images/sun.svg" alt="sun" class="hidden dark:flex context-menu-icon mr-2" />
			<span class="hidden dark:flex text-nowrap">Light Mode</span>
			<img src="/images/moon.svg" alt="moon" class="flex dark:hidden context-menu-icon mr-2" />
			<span class="flex dark:hidden text-nowrap">Dark Mode</span>
		</li>
	</ul>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.animation {
		&[data-open='false'] {
			animation-name: exit;
			animation-duration: 0.15s;
			--tw-exit-opacity: 0;
			--tw-exit-scale: 0.95;
			--tw-exit-rotate: initial;
			--tw-exit-translate-x: initial;
			--tw-exit-translate-y: initial;
		}
		&[data-open='true'] {
			animation-name: enter;
			animation-duration: 0.15s;
			--tw-enter-opacity: 0.8;
			--tw-enter-scale: 0.95;
			--tw-enter-rotate: initial;
			--tw-enter-translate-x: initial;
			--tw-enter-translate-y: initial;
		}
	}

	:global .context-menu-item {
		@apply relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 data-[state]:py-1.5 data-[state]:pl-8 data-[state]:pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50;
		&[data-state='checked'] > .context-menu-icon {
			@apply flex;
		}
		.context-menu-icon {
			@apply absolute left-2 h-3.5 w-3.5 items-center justify-center;
		}
	}
</style>
