<script lang="ts">
  import type { IMessage, IUser } from '$lib/types/delta';

  const { mentions }: Pick<IUser, 'id'> & Pick<IMessage, 'mentions'> = $props();
</script>

<span
  class="bg-purple-500 hover:bg-purple-700 text-dark rounded-md cursor-pointer transition-colors duration-300 px-4px py-2px"
>
  {id.replace(/<|>/g, '')}
</span>
