import { membersmenu, sidemenu } from '$lib/store.svelte';

let sub_sidemenu: HTMLElement | undefined = undefined;
let sub_membersmenu: HTMLElement | undefined = undefined;
sidemenu.subscribe((value) => (sub_sidemenu = value));
membersmenu.subscribe((value) => (sub_membersmenu = value));

export function registerEvents() {
  document.addEventListener('click', CloseMenu);
  document.addEventListener('auxclick', CloseMenu);
  // swipers and related logic
  document.addEventListener('touchstart', handlePointerDown);
  document.addEventListener('touchmove', handlePointerMove, { passive: false });
  document.addEventListener('touchend', handlePointerUp);
}

export function destroyEvents() {
  document.removeEventListener('click', CloseMenu);
  document.removeEventListener('auxclick', CloseMenu);
  document.removeEventListener('touchstart', handlePointerDown);
  document.removeEventListener('touchmove', handlePointerMove);
  document.removeEventListener('touchend', handlePointerUp);
}

// function for closing the menu and its logic/exceptions
function CloseMenu(e: Event) {
  const target = e.target as HTMLElement;
  if (
    !(sub_sidemenu && sub_membersmenu) ||
    // for sidemenu channels
    (sub_sidemenu.contains(target) && target.tagName !== 'A') ||
    target.role === 'separator'
  )
    return;
  if (target.ariaLabel !== 'sidemenu-button') sub_sidemenu.dataset.open = 'false';
  if (target.ariaLabel !== 'membersmenu-button') sub_membersmenu.dataset.open = 'false';
}

/// Menu Swiping Logic
/* x, y, timestamp */
let start = [0, 0, 0];
let current = [0, 0];
let firstLeft = 0;
let isSwiping = false;

function handlePointerDown(event: TouchEvent) {
  if (!sub_sidemenu) return;
  start = [event.changedTouches[0].clientX, event.changedTouches[0].clientY, Date.now()];
  firstLeft = sub_sidemenu.getBoundingClientRect().left;
  isSwiping = true;
}

function handlePointerMove(event: TouchEvent) {
  if (!isSwiping || !sub_sidemenu) return;
  current = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];

  const deltaX = current[0] - start[0];
  const deltaY = current[1] - start[1];

  // If vertical movement is greater, ignore the move
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    sub_sidemenu.style.transform = '';
    return (isSwiping = false);
  } else event.preventDefault();

  let newX = firstLeft + deltaX;

  // if swipe is beyond the item width, return to default
  if (Math.abs(newX) >= sub_sidemenu.clientWidth || newX >= 0)
    return (sub_sidemenu.style.transform = '');

  sub_sidemenu.style.transitionDuration = '0ms';

  sub_sidemenu.style.transform = 'translateX(' + newX + 'px)';
}

function handlePointerUp(event: TouchEvent) {
  if (!isSwiping || !sub_sidemenu) return;
  sub_sidemenu.style.transitionDuration = '';
  isSwiping = false;
  // TODO: better logic for the x-axis only swipes
  // if (Math.abs(start[1] - current[1]) >= 30) return ($sidemenu.style.transform = '');
  const isOpened = sub_sidemenu.dataset.open === 'true';
  const end = event.changedTouches[0].clientX;
  const diff = end - start[0];
  const bounding = Math.abs(sub_sidemenu.getBoundingClientRect().right);
  const timelimit = 300;

  sub_sidemenu.style.transform = '';

  // not opened & from left to right
  if (!isOpened && diff > 0) {
    // if its dragged beyond the middle of the screen
    if (bounding >= sub_sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
      return (sub_sidemenu.dataset.open = 'true');
    } else {
      return (sub_sidemenu.dataset.open = 'false');
    }
  } else if (isOpened && diff < 0) {
    // if its dragged beyond the middle of the screen
    if (bounding <= sub_sidemenu.clientWidth / 2 || Date.now() - start[2] <= timelimit) {
      return (sub_sidemenu.dataset.open = 'false');
    } else {
      return (sub_sidemenu.dataset.open = 'true');
    }
  }
}
