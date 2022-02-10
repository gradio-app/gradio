<script>
  import Pane from "./page_layouts/Pane.svelte";

  export let fn, components, layout, dependencies, theme, static_src;

  let values = {};
  let component_id_map = {};
  let event_listener_map = {};
  for (let component of components) {
    component_id_map[component.id] = component;
    if (component.props && "default" in component.props) {
      values[component.id] = component.props.default;
    } else {
      values[component.id] = null;
    }
    event_listener_map[component.id] = [];
  }
  dependencies.forEach((dependency, i) => {
    if (dependency.trigger === "click") {
      for (let target of dependency.targets) {
        event_listener_map[target].push(i);
      }
    }
  });

  const setValues = (i, value) => {
    values[i] = value;
  };
  console.log(event_listener_map);
  const triggerTarget = (i) => {
    event_listener_map[i].forEach((fn_index) => {
      let dependency = dependencies[fn_index];
      console.log("asdf")
      console.log(fn_index)
      console.log(dependency.inputs.map((i) => values[i]))
      fn(
        fn_index,
        dependency.inputs.map((i) => values[i])
      ).then((output) => {
        output.forEach((value, i) => {
          values[dependency.outputs[i]] = value;
        });
      });
    });
  };
</script>

<div class="mx-auto container p-4">
  <Pane
    {component_id_map}
    children={layout.children}
    {dependencies}
    {values}
    {setValues}
    {triggerTarget}
    {theme}
    {static_src}
  />
</div>
