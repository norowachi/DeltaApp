<script lang="ts">
  const { name }: { name: string } = $props();
</script>

<span
  class="font-bold bg-purple-500 hover:bg-purple-700 text-dark rounded-md cursor-pointer transition-colors duration-300 px-4px py-2px"
>
  @{name}
</span>
