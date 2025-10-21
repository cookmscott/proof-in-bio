<script>
  import { Root as CarouselRoot, Content as CarouselContent, Item as CarouselItem, Previous as CarouselPrevious, Next as CarouselNext } from '$lib/ui/carousel';
  import { Skeleton } from '$lib/ui/skeleton';
  let { images = [] } = $props();

  // Track loaded state for each image
  let loaded = $state(Array(images.length).fill(false));

  // Reset loaded state if images prop changes
  $effect(() => {
    if (images.length !== loaded.length) {
      loaded = Array(images.length).fill(false);
    }
  });
</script>

<div class="mt-4 relative">
  <CarouselRoot>
    <CarouselPrevious class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 dark:bg-black dark:hover:bg-gray-700 rounded-full shadow p-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
    </CarouselPrevious>
    <CarouselNext class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 dark:bg-black dark:hover:bg-gray-700 rounded-full shadow p-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
    </CarouselNext>
    <CarouselContent>
      {#each images as img, i}
        <CarouselItem class="basis-1/4 lg:basis-1/6 xl:basis-1/8 flex items-center justify-center">
          <div class="aspect-square w-full relative">
            {#if !loaded[i]}
              <Skeleton class="absolute inset-0 w-full h-full rounded" />
            {/if}
            <img
              src={img}
              alt={`Carousel image ${i + 1}`}
              class="w-full h-full object-cover rounded transition-opacity duration-300"
              style="opacity: {loaded[i] ? 1 : 0};"
              onload={() => loaded[i] = true}
            />
          </div>
        </CarouselItem>
      {/each}
    </CarouselContent>
  </CarouselRoot>
</div>
