<script>
  import { tick } from "svelte";

  export let label = "Title";

  export let headers = ["one", "two", "three"];
  // let sort_by = undefined;
  let id = 0;
  let editing = false;
  let selected = false;

  let els = {};

  export let default_data = [
    ["Frank", 32, "Male"],
    ["Beatrice", 99, "Female"],
    ["Simone", 999, "Male"],
  ];

  let data = default_data.map((x) =>
    x.map((n) => {
      const _id = ++id;
      els[id] = { input: null, cell: null };
      return { value: n, id: _id };
    })
  ) || [
    Array(headers.length)
      .fill(0)

      .map((_) => {
        const _id = ++id;
        els[id] = { input: null, cell: null };

        return { value: "", id: _id };
      }),
  ];

  function get_sort_status(name, sort) {
    if (!sort) return "none";
    if (sort[0] === name) {
      return sort[1];
    }
  }

  async function start_edit(id) {
    editing = id;
    await tick();
    const { input } = els[id];
    input.focus();
  }

  function handle_keydown(event, i, j, id) {
    let is_data;
    switch (event.key) {
      case "ArrowRight":
        if (editing) break;
        event.preventDefault();
        is_data = data[i][j + 1];
        selected = is_data ? is_data.id : selected;
        break;
      case "ArrowLeft":
        if (editing) break;
        event.preventDefault();
        is_data = data[i][j - 1];
        selected = is_data ? is_data.id : selected;
        break;
      case "ArrowDown":
        if (editing) break;
        event.preventDefault();
        is_data = data[i + 1];
        selected = is_data ? is_data[j].id : selected;
        break;
      case "ArrowUp":
        if (editing) break;
        event.preventDefault();
        is_data = data[i - 1];
        selected = is_data ? is_data[j].id : selected;
        break;
      case "Escape":
        event.preventDefault();
        editing = false;
        break;
      case "Enter":
        event.preventDefault();
        if (editing === id) {
          editing = false;
        } else {
          editing = id;
        }
        break;
      default:
        break;
    }
  }

  async function handle_cell_click(id) {
    editing = false;
    selected = id;
  }

  async function set_focus(id, type) {
    if (type === "edit" && typeof id == "number") {
      await tick();
      els[id].input.focus();
    }

    if (type === "edit" && typeof id == "boolean") {
      let cell = els[selected]?.cell;
      await tick();
      cell?.focus();
    }

    if (type === "select" && typeof id == "number") {
      const { cell } = els[id];
      cell.setAttribute("tabindex", 0);
      await tick();
      els[id].cell.focus();
    }
  }

  $: set_focus(editing, "edit");
  $: set_focus(selected, "select");

  let sort_direction;
  let sort_by;

  function sort(col, dir) {
    if (dir === "asc") {
      data = data.sort((a, b) => (a[col].value < b[col].value ? -1 : 1));
    } else if (dir === "des") {
      data = data.sort((a, b) => (a[col].value > b[col].value ? -1 : 1));
    }
  }

  function handle_sort(col) {
    if (typeof sort_by !== "number" || sort_by !== col) {
      sort_direction = "asc";
      sort_by = col;
    } else {
      if (sort_direction === "asc") {
        sort_direction = "des";
      } else if (sort_direction === "des") {
        sort_direction = "asc";
      }
    }

    sort(col, sort_direction);
  }
</script>

<h4 id="title">{label}</h4>
<div class="shadow overflow-hidden border-gray-200 rounded-sm relative">
  <!-- <button class="md:absolute h-10 w-36 right-0 text-xs">+ New Column</button>
  <button
    class="absolute h-9 w-full bottom-0 left-0 text-left pl-2 bg-white text-sm"
    >+ Add New Row</button
  > -->
  <table
    id="grid"
    role="grid"
    aria-labelledby="title"
    class="min-w-full divide-y divide-gray-200 "
  >
    <thead class="bg-gray-50">
      <tr>
        {#each headers as header, i}
          <!-- {@debug i, sort_by} -->
          <th
            on:click={() => handle_sort(i)}
            aria-sort={get_sort_status(header, sort_by)}
            class="after:absolute after:opacity-0 after:content-['▲'] after:ml-2 relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            class:sorted={sort_by === i}
            class:des={sort_by === i && sort_direction === "des"}
          >
            <span tabindex="-1" role="button">{header}</span>
          </th>
        {/each}
      </tr></thead
    ><tbody class="bg-white divide-y divide-gray-200">
      {#each data as row, i}
        <tr>
          {#each row as { value, id }, j (id)}
            <td
              tabindex="-1"
              class="p-0 whitespace-nowrap display-block outline-none relative "
              on:dblclick={() => start_edit(id)}
              on:click={() => handle_cell_click(id)}
              on:keydown={(e) => handle_keydown(e, i, j, id)}
              bind:this={els[id].cell}
              on:blur={({ currentTarget }) =>
                currentTarget.setAttribute("tabindex", -1)}
            >
              <div
                class:border-gray-600={selected === id}
                class="px-5 py-3 border-transparent border-[0.125rem]"
              >
                {#if editing === id}
                  <input
                    class="w-full outline-none absolute p-0 w-3/4"
                    tabindex="-1"
                    bind:value
                    bind:this={els[id].input}
                    on:blur={({ currentTarget }) =>
                      currentTarget.setAttribute("tabindex", -1)}
                  />
                {/if}
                <span
                  class=" cursor-default w-full"
                  class:opacity-0={editing === id}
                  tabindex="-1"
                  role="button">{value}</span
                >
              </div>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .sorted::after {
    opacity: 1;
  }

  .des::after {
    transform: rotate(180deg);
  }
</style>
