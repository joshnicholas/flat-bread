<script>
  /** @type {import('./$types').PageData} */
  let { data } = $props();
    import WorldMap from '$lib/components/WorldMap.svelte';
  
//   console.log(data.data); 

</script>


<WorldMap 
  data={data.data} 
  valueKey="Category"
/>

