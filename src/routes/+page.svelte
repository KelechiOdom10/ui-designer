<script lang="ts">
  import PromptInput from "~/components/PromptInput.svelte";
  import StyleSelector from "~/components/StyleSelector.svelte";
  import PreviewPane from "~/components/PreviewPane.svelte";
  import type { DesignStyle, GeneratedComponent } from "~/types/app";

  import { createMutation } from "@tanstack/svelte-query";
  import { generateDesign } from "~/lib/api";

  let prompt = $state("");
  let style = $state<DesignStyle>("modern");
  let generated = $state<GeneratedComponent | null>(null);

  const generateDesignMutation = createMutation({
    mutationFn: generateDesign,
    onSuccess(data) {
      generated = data;
    }
  });

  const handleGenerate = () => $generateDesignMutation.mutate({ prompt: prompt, style });

  const isGenerating = $generateDesignMutation.isPending;
</script>

<div class="h-screen flex {isGenerating ? 'cursor-wait' : ''}">
  <!-- Tool Panel -->
  <div class="w-96 border-r border-r-surface-600/25 p-6 flex flex-col">
    <header class="mb-6">
      <h1 class="text-xl font-semibold">Local Design AI</h1>
      <p class="text-sm text-surface-400">Create beautiful designs with AI</p>
    </header>

    <div class="space-y-6 flex-1">
      <PromptInput
        bind:value={prompt}
        disabled={isGenerating}
        placeholder="Describe your design..."
      />

      <StyleSelector bind:value={style} disabled={isGenerating} />

      <div class="flex flex-col gap-3">
        <button
          onclick={handleGenerate}
          disabled={isGenerating || !prompt}
          class="btn preset-filled-primary-500 w-full {isGenerating ? 'animate-pulse' : ''}"
        >
          {#if isGenerating}
            <span class="animate-spin mr-2">⟳</span>
          {/if}
          {isGenerating ? "Generating..." : "Generate Design"}
        </button>

        {#if generated}
          <button class="btn preset-outlined-primary-500 w-full" onclick={() => (generated = null)}>
            Clear Result
          </button>
        {/if}
      </div>
    </div>

    <footer class="mt-auto pt-4 text-sm text-surface-400">
      <p>Using style: {style}</p>
    </footer>
  </div>

  <!-- Preview Panel -->
  <div class="flex-1 p-6">
    <PreviewPane {generated} />
  </div>
</div>
