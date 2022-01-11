<script>
  import { getNextColor } from "../utils/helpers";

  export let value, theme;
  export let show_legend, color_map;
  color_map = color_map || {};
  let mode;

  if (value.length > 0) {
    for (let [_, label] of value) {
      if (label !== null) {
        if (typeof label === "string") {
          mode = "categories";
          if (!(label in color_map)) {
            let color = getNextColor(Object.keys(color_map).length);
            color_map[label] = color;
          }
        } else {
          mode = "scores";
        }
      }
    }
  }
  console.log(color_map);
</script>

<div class="output-highlightedtext" {theme}>
  {#if mode === "categories"}
    {#if show_legend}
      <div class="category-legend flex flex-wrap gap-1 mb-2">
        {#each color_map.entries() as [category, color], i}
          <div
            class="category-label px-2 py-1 rounded text-white font-semibold"
            style={"background-color" + color}
            key={i}
          >
            {category}
          </div>
        {/each}
      </div>
    {/if}
    <div
      class="textfield p-2 bg-white dark:bg-gray-800 rounded box-border max-w-full leading-8 break-all"
    >
      {#each value as [text, category], i}
        <span
          class="textspan p-1 mr-0.5 bg-opacity-20 dark:bg-opacity-80 rounded-sm"
          title={category}
          style={category === null
            ? ""
            : `color: ${color_map[category]}; background-color: ${color_map[
                category
              ].replace("1)", "var(--tw-bg-opacity))")}`}
          key={i}
        >
          <span class="text dark:text-white">{text}</span>
          {#if !show_legend && category !== null}
            <span
              class="inline-category text-xs text-white ml-0.5 px-0.5 rounded-sm"
              style={category === null
                ? ""
                : `background-color: ${color_map[category]}`}
            >
              {category}
            </span>
          {/if}
        </span>
      {/each}
    </div>
  {:else}
    {#if show_legend}
      <div
        class="color_legend flex px-2 py-1 justify-between rounded mb-3 font-semibold"
        style="background: -webkit-linear-gradient(to right,#8d83d6,(255,255,255,0),#eb4d4b); background: linear-gradient(to right,#8d83d6,rgba(255,255,255,0),#eb4d4b);"
      >
        <span>-1</span>
        <span>0</span>
        <span>+1</span>
      </div>
    {/if}
    <div
      class="textfield p-2 bg-white dark:bg-gray-800 rounded box-border max-w-full leading-8 break-all"
    >
      {#each value as [text, score], i}
        <span
          class="textspan p-1 mr-0.5 bg-opacity-20 dark:bg-opacity-80 rounded-sm"
          title={value}
          style={"background-color: rgba(" +
            (score < 0 ? "141, 131, 214," + -score : "235, 77, 75," + score) +
            ")"}
        >
          <span class="text dark:text-white">{text}</span>
        </span>
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  .output-highlightedtext[theme="default"] {
    .textfield {
      @apply shadow;
    }
  }
</style>
