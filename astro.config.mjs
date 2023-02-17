import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";

/**
 * Set's a default markdown layout
 * 
 * Thanks to @domchristie answer from https://github.com/withastro/astro/issues/397#issuecomment-1236231783
 * 
 * @note somebody is using `this` or likewise down the stack so this has to be an anonymous function to work,
 * In other words, future me: I already tried an arrow-function.
 * 
 * @returns Function for remark to use
 */
function defaultLayoutPlugin() {
  return function(_, file) {
    file.data.astro.frontmatter.layout = '@layouts/ArticleLayout.astro';
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
  ],
  markdown: {
    remarkPlugins: [ defaultLayoutPlugin ],
    shikiConfig: {
      theme: 'dark-plus'
    },
    extendDefaultPlugins: true,
  },
});
