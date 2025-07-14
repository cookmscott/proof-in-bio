<script>
  export let id = '';
  export let type = 'text';
  export let placeholder = '';
  export let required = false;
</script>
<input
  id={id}
  type={type}
  placeholder={placeholder}
  required={required}
  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
/>
