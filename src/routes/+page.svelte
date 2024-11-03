<script lang="ts">
  import PromptInput from "~/components/PromptInput.svelte";
  import StyleSelector from "~/components/StyleSelector.svelte";
  import PreviewPane from "~/components/PreviewPane.svelte";
  import type { DesignStyle, GeneratedDesign, GenerationProgress } from "~/types/app";
  import { generateDesign } from "~/lib/api";
  import { createMutation } from "@tanstack/svelte-query";

  let prompt = $state("");
  let style = $state<DesignStyle>("artistic");
  let generated = $state<GeneratedDesign | null>(null);
  let progress = $state<GenerationProgress | null>(null);
  let error = $state<string | null>(null);

  const designMutation = createMutation({
    mutationFn: async ({ prompt, style }: { prompt: string; style: DesignStyle }) => {
      progress = null;
      generated = null;
      error = null;

      try {
        for await (const update of generateDesign({ prompt, style })) {
          switch (update.event) {
            case "start":
              progress = {
                stage: "preparing",
                progress: 0
              };
              break;

            case "progress":
              progress = update.data;
              break;

            case "complete":
              generated = update.data;
              progress = null;
              return update.data;

            case "error":
              throw new Error(update.data.message);
          }
        }
      } catch (err) {
        error = err instanceof Error ? err.message : "An unknown error occurred";
        throw err;
      }
    }
  });

  let isGenerating = $designMutation.isPending;

  function handleGenerate() {
    $designMutation.mutate({ prompt, style });
  }

  function handleClear() {
    generated = null;
    progress = null;
    error = null;
    $designMutation.reset();
  }
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

      {#if error || $designMutation.error}
        <div class="p-4 bg-surface-800 text-red-400 rounded-md">
          {error ||
            ($designMutation.error instanceof Error
              ? $designMutation.error.message
              : "An error occurred")}
        </div>
      {/if}

      <div class="flex flex-col gap-3">
        <button
          onclick={handleGenerate}
          disabled={isGenerating || !prompt}
          class="btn preset-filled-primary-500"
        >
          {#if isGenerating}
            <span class="inline-block animate-spin mr-2">⟳</span>
            Generating...
          {:else}
            Generate Design
          {/if}
        </button>

        {#if generated}
          <button class="btn preset-outline-primary-500" onclick={handleClear}>
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
    <PreviewPane {generated} {progress} />
  </div>
</div>
