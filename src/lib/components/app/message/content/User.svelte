<script lang="ts">
  import type { IMessage, IUser } from '$lib/types/delta';

  const data: Pick<IUser, 'id'> & Pick<IMessage, 'mentions'> = $props();
  console.log('User', data);
</script>

<span
  class="bg-purple-500 hover:bg-purple-700 text-dark rounded-md cursor-pointer transition-colors duration-300 px-4px py-2px"
>
  {data.id.replace(/<|>/g, '')}
</span>
