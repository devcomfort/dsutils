<script lang="ts">
  import { SvelteUIProvider, globalCss } from "@svelteuidev/core";
  import { onMount } from "svelte";

  // 컬러 팔레트 참조 : https://www.pinterest.co.kr/pin/196610339977626951/
  const globalStyles = globalCss({
    body: {
      margin: 0,
      width: "100vw",
      height: "100vh",
      color: "#ffffff",
      backgroundColor: "#191e29",
    },
  });

  onMount(() => {
    globalStyles();
  });
</script>

<SvelteUIProvider withNormalizeCSS withGlobalStyles>
  <slot />
</SvelteUIProvider>
