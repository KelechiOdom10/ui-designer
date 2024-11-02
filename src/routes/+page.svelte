<script lang="ts">
  import PromptInput from "~/components/PromptInput.svelte";
  import StyleSelector from "~/components/StyleSelector.svelte";
  import PreviewPane from "~/components/PreviewPane.svelte";
  import type { DesignStyle } from "~/types/app";
  import type { GeneratedComponent } from "~/types/generation";

  let prompt = $state("");
  let style = $state<DesignStyle>("modern");
  let generated = $state<GeneratedComponent | null>(null);
  let isGenerating = $state(false);

  async function handleGenerate() {
    if (!prompt) return;
    isGenerating = true;

    try {
      // This will be replaced with actual generation logic
      generated = {
        markup: "<h1>Hello</h1>",
        preview: "<h1>Hello</h1>"
      };
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="h-screen flex">
  <!-- Tool Panel -->
  <div class="w-96 border-r border-r-surface-600/25 p-6 flex flex-col">
    <h1 class="text-xl font-semibold mb-6">Local Design AI</h1>

    <div class="space-y-6">
      <PromptInput bind:value={prompt} />
      <StyleSelector bind:value={style} />

      <button
        onclick={handleGenerate}
        disabled={isGenerating || !prompt}
        class="btn preset-filled-primary-500 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Generating..." : "Generate Design"}
      </button>
    </div>
  </div>

  <!-- Preview Panel -->
  <div class="flex-1 p-6">
    <PreviewPane {generated} />
  </div>
</div>
