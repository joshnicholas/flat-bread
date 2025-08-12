<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import * as topojson from 'topojson-client';

  let { 
    data, // Array of objects with 'Country' key
    valueKey, // Key in data objects to use for coloring
    width,
    height 
  } = $props();

  let svg = $state();
  let mounted = $state(false);
  let container = $state();

  onMount(() => {
    mounted = true;
    updateDimensions();
    createMap();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      createMap();
    });
    
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  });

  function updateDimensions() {
    if (container) {
      width = container.clientWidth;
      height = width * 0.5; // Maintain aspect ratio
    }
  }

  $effect(() => {
    if (mounted && data) {
      createMap();
    }
  });

  async function createMap() {
    if (!svg || !data?.length) return;
    
    // Clear existing content
    d3.select(svg).selectAll('*').remove();

    try {
      // Load the topojson data
      const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const countries = topojson.feature(world, world.objects.countries);

      // Create a map from country name to category value
      const dataMap = new Map();
      data.forEach(d => {
        if (d.Country && d[valueKey]) {
          dataMap.set(d.Country, d[valueKey]);
        }
      });

      // Get unique category values for categorical color scale
      const uniqueCategories = Array.from(new Set(Array.from(dataMap.values())));
      
      // Create categorical color scale
      const colors = [
        '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', 
        '#ffff33', '#a65628', '#f781bf', '#999999', '#66c2a5',
        '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'
      ];
      
      const colorScale = d3.scaleOrdinal()
        .domain(uniqueCategories)
        .range(colors);

      // Create projection
      const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], countries);

      const path = d3.geoPath().projection(projection);

      // Create SVG
      const svgEl = d3.select(svg)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto');

      // Add countries
      svgEl.selectAll('path')
        .data(countries.features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', d => {
          const countryName = d.properties.name;
          const category = dataMap.get(countryName);
          return category ? colorScale(category) : '#f0f0f0';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const countryName = d.properties.name;
          const category = dataMap.get(countryName);
          
          d3.select(this).attr('stroke-width', 2);
          
          // Simple tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'map-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .html(`${countryName}<br/>${valueKey}: ${category || 'No data'}`);
          
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('stroke-width', 0.5);
          d3.selectAll('.map-tooltip').remove();
        });

      // Add legend for categorical data
      if (uniqueCategories.length > 0) {
        const legendItemHeight = 20;
        const legendItemWidth = 15;
        const legendPadding = 5;
        
        const legend = svgEl.append('g')
          .attr('transform', `translate(20, 20)`);

        // Add legend items
        const legendItems = legend.selectAll('.legend-item')
          .data(uniqueCategories)
          .enter().append('g')
          .attr('class', 'legend-item')
          .attr('transform', (d, i) => `translate(0, ${i * (legendItemHeight + legendPadding)})`);

        // Add colored rectangles
        legendItems.append('rect')
          .attr('width', legendItemWidth)
          .attr('height', legendItemHeight)
          .attr('fill', d => colorScale(d))
          .attr('stroke', '#333')
          .attr('stroke-width', 1);

        // Add text labels
        legendItems.append('text')
          .attr('x', legendItemWidth + 8)
          .attr('y', legendItemHeight / 2)
          .attr('dy', '0.35em')
          .style('font-size', '12px')
          .style('font-family', 'Arial, sans-serif')
          .style('fill', '#333')
          .text(d => d);
      }

    } catch (error) {
      console.error('Error creating map:', error);
    }
  }
</script>

<div bind:this={container} class="w-full h-auto">
  <svg bind:this={svg} class="w-full h-auto"></svg>
</div>