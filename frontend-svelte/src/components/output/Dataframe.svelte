<script>
  export let value, theme;
  export let headers, max_rows, max_cols, overflow_row_behaviour;
  let page = 0;
  let sort_by = null;
  let sort_descending = false;

  let table_headers = headers || value.headers;
  let row_count = value.data.length;
  let col_count = row_count > 0 ? value.data[0].length : 0;
  let selected_data = value.data.slice();
  if (sort_by) {
    let sort_fn;
    if (sort_descending) {
      sort_fn = (a, b) =>
        a[sort_by] === b[sort_by] ? 0 : a[sort_by] < b[sort_by] ? 1 : -1;
    } else {
      sort_fn = (a, b) =>
        a[sort_by] === b[sort_by] ? 0 : a[sort_by] < b[sort_by] ? -1 : 1;
    }
    selected_data.sort(sort_fn);
  }
  let visible_pages = null;
  if (max_rows !== null && row_count > max_rows) {
    if (overflow_row_behaviour === "paginate") {
      selected_data = selected_data.slice(page * max_rows, page + 1 * max_rows);
      let page_count = Math.ceil(row_count / max_rows);
      visible_pages = [];
      [0, page, page_count - 1].forEach((anchor) => {
        for (let i = anchor - 2; i <= anchor + 2; i++) {
          if (i >= 0 && i < page_count && !visible_pages.includes(i)) {
            if (
              visible_pages.length > 0 &&
              i - visible_pages[visible_pages.length - 1] > 1
            ) {
              visible_pages.push(null);
            }
            visible_pages.push(i);
          }
        }
      });
    } else {
      selected_data = selected_data
        .slice(0, Math.ceil(max_rows / 2))
        .concat(
          [Array(col_count).fill("...")],
          selected_data.slice(row_count - Math.floor(max_rows / 2))
        );
    }
  }
  if (max_cols !== null && col_count > max_cols) {
    let [hidden_col_start, hidden_col_end] = [
      Math.ceil(max_cols / 2),
      col_count - Math.floor(max_cols / 2) - 1,
    ];
    table_headers =
      table_headers.slice(0, hidden_col_start) +
      ["..."] +
      table_headers.slice(hidden_col_end);
    selected_data = selected_data.map(
      (row) =>
        row.slice(0, hidden_col_start) + ["..."] + row.slice(hidden_col_end)
    );
  }

  const sort_table = (col_index) => {
    if (sort_by === col_index) {
      sort_descending = !sort_descending;
    } else {
      sort_by = col_index;
      sort_descending = false;
    }
    page = 0;
  };
</script>

<div class="output-dataframe" {theme}>
  <table>
    {#if table_headers}
      <thead class="font-bold border-gray-200 border-b-2">
        {#each table_headers as header, i}
          <th class="px-4 transition cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" key={i} on:click={() => sort_table(i)}>
            {header}
            {#if sort_by === i}
              <svg
                class="caret h-3 inline-block ml-1 mb-0.5 fill-current"
                viewBox="0 0 20 20"
                transform={sort_descending ? "scale(1, -1)" : ""}
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />{" "}
              </svg>
            {/if}
          </th>
        {/each}
      </thead>
    {/if}
    <tbody>
      {#each selected_data as row, i}
        <tr key={i}>
          {#each row as cell, j}
            <td class="px-4" key={j}>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
</style>
