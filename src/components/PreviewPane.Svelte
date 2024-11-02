<script lang="ts">
  import { Layout } from "lucide-svelte";
  import type { GeneratedComponent } from "../types/generation";
  interface Props {
    generated: GeneratedComponent | null;
  }

  let { generated }: Props = $props();
</script>

<div class="h-full bg-surface-900 rounded-lg p-4">
  {#if generated}
    <div class="bg-white rounded-lg shadow-lg p-6 h-full overflow-auto">
      {@html generated.preview}
    </div>
  {:else}
    <div class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <Layout size={48} class="mx-auto mb-4" />
        <p>Your generated design will appear here</p>
      </div>
    </div>
  {/if}
</div>
