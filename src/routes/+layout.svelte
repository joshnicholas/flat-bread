<script>
	let { children } = $props();
	  import '../app.css';
</script>

<!-- <nav>
	<a href="/">home</a>
	<a href="/about">about</a>
</nav> -->

{@render children()}


<div class="max-w-4xl mx-auto">
  <footer class="text-center mt-8">
    <p class="text-gray-500 text-sm">A Claude & Josh joint.</p>
  </footer>
</div>