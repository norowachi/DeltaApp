<script lang="ts">
  const { author }: { author: Pick<IUser, 'avatar' | 'username'> } = $props();
</script>

<img
  src={author.avatar || 'https://api.deltaapp.net/images/delta-0.png'}
  alt={author.username}
  height="40"
  width="40"
  class="rounded-full select-none max-w-40px max-h-40px"
  loading="lazy"
  onerror={(e) =>
    ((e.currentTarget as HTMLImageElement).src = 'https://api.deltaapp.net/images/delta-0.png')}
/>
