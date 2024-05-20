

components_content = """
<script lang="ts">
    import {{get_object}} from "$lib/components/process_json.ts";
    import ParamTable from "$lib/components/ParamTable.svelte";
    import ShortcutTable from "$lib/components/ShortcutTable.svelte";
    import DemosSection from "$lib/components/DemosSection.svelte";
    import FunctionsSection from "$lib/components/FunctionsSection.svelte";
    import GuidesSection from "$lib/components/GuidesSection.svelte";
    import CopyButton from "$lib/components/CopyButton.svelte";
    import {{ style_formatted_text }} from "$lib/text";

    let obj = get_object("{name}");
</script>

<!--- Title -->
# {{obj.name}}

<!--- Usage -->
```python
gradio.{obj[name]}(···)
```

<!--- Description -->
### Description
## {{@html style_formatted_text(obj.description)}}

<!-- Behavior -->
### Behavior
## **As input component**: {{@html style_formatted_text(obj.preprocess.return_doc.doc)}}
##### Your function should accept one of these types:

```python
def predict(
	value: {obj[preprocess][return_doc][annotation]}
)
	...
```

<br>

## **As output component**: {{@html style_formatted_text(obj.postprocess.parameter_doc[0].doc)}}
##### Your function should return one of these types:

```python
def predict(···) -> {obj[postprocess][parameter_doc][0][annotation]}
	...	
	return value
```


<!--- Initialization -->
### Initialization
<ParamTable parameters={{obj.parameters}} />


{{#if obj.string_shortcuts && obj.string_shortcuts.length > 0}}
<!--- Shortcuts -->
### Shortcuts
<ShortcutTable shortcuts={{obj.string_shortcuts}} />
{{/if}}

{{#if obj.demos && obj.demos.length > 0}}
<!--- Demos -->
### Demos 
<DemosSection demos={{obj.demos}} />
{{/if}}

{{#if obj.fns && obj.fns.length > 0}}
<!--- Event Listeners -->
### Event Listeners 
<FunctionsSection fns={{obj.fns}} event_listeners={{true}} />
{{/if}}

{{#if obj.guides && obj.guides.length > 0}}
<!--- Guides -->
### Guides
<GuidesSection guides={{obj.guides}}/>
{{/if}}
"""


other_contnet = """
<script lang="ts">
    import {{get_object}} from "$lib/components/process_json.ts";
    import ParamTable from "$lib/components/ParamTable.svelte";
    import ShortcutTable from "$lib/components/ShortcutTable.svelte";
    import DemosSection from "$lib/components/DemosSection.svelte";
    import FunctionsSection from "$lib/components/FunctionsSection.svelte";
    import GuidesSection from "$lib/components/GuidesSection.svelte";
    import CopyButton from "$lib/components/CopyButton.svelte";
    import {{ style_formatted_text }} from "$lib/text";

    let obj = get_object("{name}");
</script>

<!--- Title -->
# {{obj.name}}

<!--- Usage -->
```python
gradio.{obj[name]}(···)
```

<!--- Description -->
### Description
## {{@html style_formatted_text(obj.description)}}

<!-- Example Usage --> 

{{#if obj.example}}
### Example Usage
```python
{obj[example]}
```
{{/if}}

<!--- Initialization -->
### Initialization
<ParamTable parameters={{obj.parameters}} />


{{#if obj.demos && obj.demos.length > 0}}
<!--- Demos -->
### Demos 
<DemosSection demos={{obj.demos}} />
{{/if}}

{{#if obj.fns && obj.fns.length > 0}}
<!--- Methods -->
### Methods 
<FunctionsSection fns={{obj.fns}} event_listeners={{false}} />
{{/if}}

{{#if obj.guides && obj.guides.length > 0}}
<!--- Guides -->
### Guides
<GuidesSection guides={{obj.guides}}/>
{{/if}}
"""

import json

PATH = "../templates/"

with open("../json/docs.json", "r") as j:
    data = json.load(j)

    components = data["docs"]["gradio"]["components"]
    building = data["docs"]["gradio"]["building"]
    routes = data["docs"]["gradio"]["routes"]

    # for name, obj in components.items():
    #     with open(PATH + f"gradio/03_components/{name}.svx", "w+") as file:
    #         file.write(components_content.format(name=name, obj=obj))
    #     print(f"Created {name}.svx")

    for name, obj in routes.items():
        with open(PATH + f"gradio/06_routes/{name}.svx", "w+") as file:
            file.write(other_contnet.format(name=name, obj=obj))
        print(f"Created {name}.svx")


