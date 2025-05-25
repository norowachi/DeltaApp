import { membersmenu, sidemenu } from '$lib/store.svelte';

let sub_sidemenu: HTMLElement | undefined = undefined;
let sub_membersmenu: HTMLElement | undefined = undefined;
sidemenu.subscribe((value) => (sub_sidemenu = value));
membersmenu.subscribe((value) => (sub_membersmenu = value));
