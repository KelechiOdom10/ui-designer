<script lang="ts">
  import { Layout } from "lucide-svelte";
  import type { GeneratedDesign, GenerationProgress } from "~/types/app";
  import { fade } from "svelte/transition";

  let {
    generated = null,
    progress = null
  }: {
    generated: GeneratedDesign | null;
    progress?: GenerationProgress | null;
  } = $props();

  let previewContent = $derived(generated?.preview || progress?.partial || null);
  let previewStyle = $derived(generated?.css || "");
  let isGenerating = $derived(progress !== null);

  let styleElement = $state<HTMLStyleElement | null>(null);

  $effect(() => {
    if (styleElement) {
      styleElement.textContent = previewStyle;
    }
  });
</script>

<div class="h-full bg-surface-900 rounded-lg p-4">
  {#if previewContent}
    <div
      class="bg-surface-900 rounded-lg shadow-lg p-6 h-full overflow-auto relative"
      transition:fade
    >
      <iframe
        srcDoc={previewContent}
        style="width: 100%; height: 100%; border: none;"
        title="Design Preview"
        sandbox="allow-scripts"
      ></iframe>

      {#if isGenerating}
        <div
          class="absolute top-2 right-2 bg-surface-800 text-surface-300 px-3 py-1 rounded-full text-sm"
        >
          {Math.round(progress?.progress || 0)}% - {progress?.stage || ""}
        </div>
      {/if}
    </div>
  {:else}
    <div class="h-full flex items-center justify-center text-gray-400" transition:fade>
      <div class="text-center">
        <Layout size={48} class="mx-auto mb-4" />
        <p>Your generated design will appear here</p>
        {#if isGenerating}
          <p class="mt-2 text-sm text-surface-500">
            {progress?.stage} - {Math.round(progress?.progress || 0)}%
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if generated}
    <div class="mt-4 space-y-4 text-surface-300" transition:fade>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          onclick={() => {
            const blob = new Blob([generated.markup], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "generated-design.html";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download HTML
        </button>
        <button
          class="px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          onclick={() => {
            const blob = new Blob([generated.css], { type: "text/css" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "generated-design.css";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download CSS
        </button>
      </div>

      <div class="space-y-2">
        <h3 class="font-medium">Generation Details</h3>
        <div class="text-sm text-surface-500">
          <p>Generated at: {new Date(generated.metadata.generatedAt).toLocaleString()}</p>
          <p>Processing time: {Math.round(generated.metadata.processingTime)}ms</p>
          <p>Style: {generated.metadata.style}</p>
          <p>ID: {generated.metadata.promptId}</p>
        </div>
      </div>
    </div>
  {/if}
</div>
