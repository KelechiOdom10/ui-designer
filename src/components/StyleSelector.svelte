<script lang="ts">
  import type { DesignStyle } from "../types/app";
  import type { HTMLSelectAttributes } from "svelte/elements";

  let { value = $bindable("modern"), ...rest }: HTMLSelectAttributes = $props();

  const styles: Array<{ value: DesignStyle; label: string }> = [
    { value: "artistic", label: "Artistic" },
    { value: "brutalist", label: "Brutalist" },
    { value: "editorial", label: "Editorial" },
    { value: "experiential", label: "Experiential" },
    { value: "maximalist", label: "Maximalist" },
    { value: "professional", label: "Professional" },
    { value: "retro", label: "Retro" }
  ];
</script>

<div class="space-y-2">
  <label for="style-selector" class="label label-text">Style</label>
  <select id="style-selector" bind:value class="select h-10 px-2" {...rest}>
    {#each styles as style}
      <option value={style.value}>{style.label}</option>
    {/each}
  </select>
</div>
