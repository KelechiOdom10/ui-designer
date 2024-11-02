<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";

  let { value = $bindable() }: HTMLTextareaAttributes = $props();
</script>

<label class="label">
  <span class="label-text">What would you like to design?</span>
  <textarea
    class="textarea p-1"
    rows="4"
    bind:value
    placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
  ></textarea>
</label>
