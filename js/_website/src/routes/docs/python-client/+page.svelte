<script>
    import DocsNav from '../../../components/DocsNav.svelte';
    import MetaTags from "../../../components/MetaTags.svelte";
    import dataflow_svg from "../../../assets/img/dataflow.svg";


    export let data;

    let docs = data.docs;
    let components = data.components;
    let helpers = data.helpers;
    let routes = data.routes;
    let ordered_events = data.ordered_events;
    let py_client = data.py_client;

</script>


  <MetaTags title={"Gradio Python Client Docs"} 
            url={"https://gradio.app/docs/python-client"} 
            canonical={"https://gradio.app/docs/python-client"}
            description={"The lightweight Gradio client library that makes it easy to use any Gradio app as an API"}/>

<main class="container mx-auto px-4 flex gap-4">

    <DocsNav current_nav_link={"python-client"} components={components} helpers={helpers} routes={routes} py_client={py_client} />
    
    <div class="flex flex-col w-full min-w-full	lg:w-10/12 lg:min-w-0">
        <div>
          <p class="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit float-left">
            New to Gradio? Start here: <a class="link" href="/quickstart">Getting Started</a>
          </p>
          <p class="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 px-4 py-1 rounded-full text-green-800 mb-1 w-fit float-left sm:float-right">
            See the <a class="link" href="/changelog">Release History</a>
          </p>
        </div>

        <div class="flex justify-between mt-4">
            <a href="/docs/mount_gradio_app"
                class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline">
            <div class="text-lg"><span class="text-orange-500">&#8592;</span> mount_gradio_app</div>
            </a>
            <a href="/docs/client"
                class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
            <div class="text-lg">Client <span class="text-orange-500">&#8594;</span></div>
            </a>
        </div>
        <div class="flex flex-row">

        
        <div class="lg:w-3/4 lg:ml-10 lg:mr-24">
        <div class="obj" id="python-client">

        <h2 id="python-client-header"
            class="text-4xl font-light mb-2 pt-2 text-orange-500">
          Python Client
        </h2>
        
        <p class="mt-8 mb-2 text-lg">
            The lightweight Gradio client libraries make it easy to use any Gradio app as an API. We currently support a Python client library and are developing client libraries in other languages.
        </p>

        <p class="mt-2 text-lg">
          The Python client library is <code class="language-bash">gradio_client</code>. It's included in the latest versions of the <code class="language-bash">gradio</code> package, but for a more lightweight experience, you can install it using <code class="language-bash">pip</code> without having to install <code class="language-bash">gradio</code>:
        </p>

        <div class="codeblock  bg-gray-50 mx-auto p-3 my-3"><pre><code class="language-bash">pip install gradio_client</code></pre></div>

                  </div>
                  </div>
                  </div>

        <div class="flex justify-between my-4">
            <a href="/docs/block-layouts"
                class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline">
            <div class="text-lg"><span class="text-orange-500">&#8592;</span> Block Layouts</div>
            </a>
            <a href="/docs/audio"
                class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline">
            <div class="text-lg">Audio <span class="text-orange-500">&#8594;</span></div>
            </a>
        </div>

        
</div>

</main>

