# Environment Variables

Environment variables in Gradio provide a way to customize your applications and launch settings without changing the codebase. In this guide, we'll explore the key environment variables supported in Gradio and how to set them.

## Key Environment Variables

### 1. `GRADIO_SERVER_PORT`

- **Description**: Specifies the port on which the Gradio app will run.
- **Default**: `7860`
- **Example**:
  ```bash
  export GRADIO_SERVER_PORT=8000
  ```

### 2. `GRADIO_SERVER_NAME`

- **Description**: Defines the host name for the Gradio server. To make Gradio accessible from any IP address, set this to `"0.0.0.0"`
- **Default**: `"127.0.0.1"` 
- **Example**:
  ```bash
  export GRADIO_SERVER_NAME="0.0.0.0"
  ```

### 3. `GRADIO_NUM_PORTS`

- **Description**: Defines the number of ports to try when starting the Gradio server.
- **Default**: `100`
- **Example**:
  ```bash
  export GRADIO_NUM_PORTS=200
  ```

### 4. `GRADIO_ANALYTICS_ENABLED`

- **Description**: Whether Gradio should provide 
- **Default**: `"True"`
- **Options**: `"True"`, `"False"`
- **Example**:
  ```sh
  export GRADIO_ANALYTICS_ENABLED="True"
  ```

### 5. `GRADIO_DEBUG`

- **Description**: Enables or disables debug mode in Gradio. If debug mode is enabled, the main thread does not terminate allowing error messages to be printed in environments such as Google Colab.
- **Default**: `0`
- **Example**:
  ```sh
  export GRADIO_DEBUG=1
  ```

### 6. `GRADIO_FLAGGING_MODE`

- **Description**: Controls whether users can flag inputs/outputs in the Gradio interface. See [the Guide on flagging](/guides/using-flagging) for more details.
- **Default**: `"manual"`
- **Options**: `"never"`, `"manual"`, `"auto"`
- **Example**:
  ```sh
  export GRADIO_FLAGGING_MODE="never"
  ```

### 7. `GRADIO_TEMP_DIR`

- **Description**: Specifies the directory where temporary files created by Gradio are stored.
- **Default**: System default temporary directory
- **Example**:
  ```sh
  export GRADIO_TEMP_DIR="/path/to/temp"
  ```

### 8. `GRADIO_ROOT_PATH`

- **Description**: Sets the root path for the Gradio application. Useful if running Gradio [behind a reverse proxy](/guides/running-gradio-on-your-web-server-with-nginx).
- **Default**: `""`
- **Example**:
  ```sh
  export GRADIO_ROOT_PATH="/myapp"
  ```

### 9. `GRADIO_SHARE`

- **Description**: Enables or disables sharing the Gradio app.
- **Default**: `"False"`
- **Options**: `"True"`, `"False"`
- **Example**:
  ```sh
  export GRADIO_SHARE="True"
  ```

### 10. `GRADIO_ALLOWED_PATHS`

- **Description**: Sets a list of complete filepaths or parent directories that gradio is allowed to serve. Must be absolute paths. Warning: if you provide directories, any files in these directories or their subdirectories are accessible to all users of your app. Multiple items can be specified by separating items with commas.
- **Default**: `""`
- **Example**:
  ```sh
  export GRADIO_ALLOWED_PATHS="/mnt/sda1,/mnt/sda2"
  ```

### 11. `GRADIO_BLOCKED_PATHS`

- **Description**: Sets a list of complete filepaths or parent directories that gradio is not allowed to serve (i.e. users of your app are not allowed to access). Must be absolute paths. Warning: takes precedence over `allowed_paths` and all other directories exposed by Gradio by default. Multiple items can be specified by separating items with commas.
- **Default**: `""`
- **Example**:
  ```sh
  export GRADIO_BLOCKED_PATHS="/users/x/gradio_app/admin,/users/x/gradio_app/keys"
  ```

### 12. `FORWARDED_ALLOW_IPS`

- **Description**: This is not a Gradio-specific environment variable, but rather one used in server configurations, specifically `uvicorn` which is used by Gradio internally. This environment variable is useful when deploying applications behind a reverse proxy. It defines a list of IP addresses that are trusted to forward traffic to your application. When set, the application will trust the `X-Forwarded-For` header from these IP addresses to determine the original IP address of the user making the request. This means that if you use the `gr.Request` [object's](https://www.gradio.app/docs/gradio/request) `client.host` property, it will correctly get the user's IP address instead of the IP address of the reverse proxy server. Note that only trusted IP addresses (i.e. the IP addresses of your reverse proxy servers) should be added, as any server with these IP addresses can modify the `X-Forwarded-For` header and spoof the client's IP address.
- **Default**: `"127.0.0.1"`
- **Example**:
  ```sh
  export FORWARDED_ALLOW_IPS="127.0.0.1,192.168.1.100"
  ```

### 13. `GRADIO_CACHE_EXAMPLES`

- **Description**: Whether or not to cache examples by default in `gr.Interface()`, `gr.ChatInterface()` or in `gr.Examples()` when no explicit argument is passed for the `cache_examples` parameter. You can set this environment variable to either the string "true" or "false".
- **Default**: `"false"`
- **Example**:
  ```sh
  export GRADIO_CACHE_EXAMPLES="true"
  ```


### 14. `GRADIO_CACHE_MODE`

- **Description**: How to cache examples. Only applies if `cache_examples` is set to `True` either via enviornment variable or by an explicit parameter, AND no no explicit argument is passed for the `cache_mode` parameter in `gr.Interface()`, `gr.ChatInterface()` or in `gr.Examples()`. Can be set to either the strings "lazy" or "eager." If "lazy", examples are cached after their first use for all users of the app. If "eager", all examples are cached at app launch.

- **Default**: `"eager"`
- **Example**:
  ```sh
  export GRADIO_CACHE_MODE="lazy"
  ```


### 15. `GRADIO_EXAMPLES_CACHE`

- **Description**:  If you set `cache_examples=True` in `gr.Interface()`, `gr.ChatInterface()` or in `gr.Examples()`, Gradio will run your prediction function and save the results to disk. By default, this is in the `.gradio/cached_examples//` subdirectory within your app's working directory. You can customize the location of cached example files created by Gradio by setting the environment variable `GRADIO_EXAMPLES_CACHE` to an absolute path or a path relative to your working directory.
- **Default**: `".gradio/cached_examples/"`
- **Example**:
  ```sh
  export GRADIO_EXAMPLES_CACHE="custom_cached_examples/"
  ```


### 16. `GRADIO_SSR_MODE`

- **Description**: Controls whether server-side rendering (SSR) is enabled. When enabled, the initial HTML is rendered on the server rather than the client, which can improve initial page load performance and SEO.

- **Default**: `"False"` (except on Hugging Face Spaces, where this environment variable sets it to `True`)
- **Options**: `"True"`, `"False"`
- **Example**:
  ```sh
  export GRADIO_SSR_MODE="True"
  ```

### 17. `GRADIO_NODE_SERVER_NAME`

- **Description**: Defines the host name for the Gradio node server. (Only applies if `ssr_mode` is set to `True`.)
- **Default**: `GRADIO_SERVER_NAME` if it is set, otherwise `"127.0.0.1"`
- **Example**:
  ```sh
  export GRADIO_NODE_SERVER_NAME="0.0.0.0"
  ```

### 18. `GRADIO_NODE_NUM_PORTS`

- **Description**: Defines the number of ports to try when starting the Gradio node server. (Only applies if `ssr_mode` is set to `True`.)
- **Default**: `100`
- **Example**:
  ```sh
  export GRADIO_NODE_NUM_PORTS=200
  ```

### 19. `GRADIO_RESET_EXAMPLES_CACHE`

- **Description**: If set to "True", Gradio will delete and recreate the examples cache directory when the app starts instead of reusing the cached example if they already exist. 
- **Default**: `"False"`
- **Options**: `"True"`, `"False"`
- **Example**:
  ```sh
  export GRADIO_RESET_EXAMPLES_CACHE="True"
  ```

### 20. `GRADIO_CHAT_FLAGGING_MODE`

- **Description**: Controls whether users can flag messages in `gr.ChatInterface` applications. Similar to `GRADIO_FLAGGING_MODE` but specifically for chat interfaces.
- **Default**: `"never"`
- **Options**: `"never"`, `"manual"`
- **Example**:
  ```sh
  export GRADIO_CHAT_FLAGGING_MODE="manual"
  ```



## How to Set Environment Variables

To set environment variables in your terminal, use the `export` command followed by the variable name and its value. For example:

```sh
export GRADIO_SERVER_PORT=8000
```

If you're using a `.env` file to manage your environment variables, you can add them like this:

```sh
GRADIO_SERVER_PORT=8000
GRADIO_SERVER_NAME="localhost"
```

Then, use a tool like `dotenv` to load these variables when running your application.



