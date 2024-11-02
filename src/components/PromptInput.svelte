<script lang="ts">
  export let value = '';
</script>

<div class="space-y-2">
  <label for="design-prompt" class="block text-sm font-medium text-gray-700">
    What would you like to design?
  </label>
  <textarea
    id="design-prompt"
    bind:value
   class="textarea" 
   rows="4"
    placeholder="Describe the component or section you want to create..."
  ></textarea>
</div>
