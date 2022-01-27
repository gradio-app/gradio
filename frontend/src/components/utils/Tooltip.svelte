<script>
  export let text;
  export let x;
  export let y;
  export let color;

  let w, h;
</script>

<div
  bind:offsetWidth={w}
  bind:offsetHeight={h}
  style="
		top: {y - h / 2}px;
		left: {x - w - 7}px;"
>
  <span style="background: {color}" />{text}
</div>

<style>
  div {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 2px;
    padding: 4px;
    position: absolute;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 3px;
  }
</style>
