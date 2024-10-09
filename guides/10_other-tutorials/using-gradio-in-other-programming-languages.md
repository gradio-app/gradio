# Using Gradio in Other Programming Languages

The core `gradio` library is a Python library. But you can also use `gradio` to create UIs around programs written in other languages, thanks to Python's ability to interface with external processes. Using Python's `subprocess` module, you can call programs written in C++, Rust, or virtually any other language, allowing `gradio` to become a flexible UI layer for non-Python applications.

In this post, we'll walk through how to integrate `gradio` with C++ and Rust, using Python's `subprocess` module to invoke code written in these languages. We'll also discuss how to use Gradio with R, which is even easier, thanks to the [reticulate](https://rstudio.github.io/reticulate/) R package, which makes it possible to install and import Python modules in R.

## Using Gradio with C++

Let’s start with a simple example of integrating a C++ program into a Gradio app. Suppose we have the following C++ program that adds two numbers:

```cpp
// add.cpp
#include <iostream>

int main() {
    double a, b;
    std::cin >> a >> b;
    std::cout << a + b << std::endl;
    return 0;
}
```

This program reads two numbers from standard input, adds them, and outputs the result.

We can build a Gradio interface around this C++ program using Python's `subprocess` module. Here’s the corresponding Python code:

```python
import gradio as gr
import subprocess

def add_numbers(a, b):
    process = subprocess.Popen(
        ['./add'], 
        stdin=subprocess.PIPE, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    )
    output, error = process.communicate(input=f"{a} {b}\n".encode())
    
    if error:
        return f"Error: {error.decode()}"
    return float(output.decode().strip())

demo = gr.Interface(
    fn=add_numbers, 
    inputs=[gr.Number(label="Number 1"), gr.Number(label="Number 2")], 
    outputs=gr.Textbox(label="Result")
)

demo.launch()
```

Here, `subprocess.Popen` is used to execute the compiled C++ program (`add`), pass the input values, and capture the output. You can compile the C++ program by running:

```bash
g++ -o add add.cpp
```

This example shows how easy it is to call C++ from Python using `subprocess` and build a Gradio interface around it.

## Using Gradio with Rust

Now, let’s move to another example: calling a Rust program to apply a sepia filter to an image. The Rust code could look something like this:

```rust
// sepia.rs
extern crate image;

use image::{GenericImageView, ImageBuffer, Rgba};

fn sepia_filter(input: &str, output: &str) {
    let img = image::open(input).unwrap();
    let (width, height) = img.dimensions();
    let mut img_buf = ImageBuffer::new(width, height);

    for (x, y, pixel) in img.pixels() {
        let (r, g, b, a) = (pixel[0] as f32, pixel[1] as f32, pixel[2] as f32, pixel[3]);
        let tr = (0.393 * r + 0.769 * g + 0.189 * b).min(255.0);
        let tg = (0.349 * r + 0.686 * g + 0.168 * b).min(255.0);
        let tb = (0.272 * r + 0.534 * g + 0.131 * b).min(255.0);
        img_buf.put_pixel(x, y, Rgba([tr as u8, tg as u8, tb as u8, a]));
    }

    img_buf.save(output).unwrap();
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: sepia <input_file> <output_file>");
        return;
    }
    sepia_filter(&args[1], &args[2]);
}
```

This Rust program applies a sepia filter to an image. It takes two command-line arguments: the input image path and the output image path. You can compile this program using:

```bash
cargo build --release
```

Now, we can call this Rust program from Python and use Gradio to build the interface:

```python
import gradio as gr
import subprocess

def apply_sepia(input_path):
    output_path = "output.png"
    
    process = subprocess.Popen(
        ['./target/release/sepia', input_path, output_path], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    )
    process.wait()
    
    return output_path

demo = gr.Interface(
    fn=apply_sepia, 
    inputs=gr.Image(type="filepath", label="Input Image"), 
    outputs=gr.Image(label="Sepia Image")
)

demo.launch()
```

Here, when a user uploads an image and clicks submit, Gradio calls the Rust binary (`sepia`) to process the image, and returns the sepia-filtered output to Gradio.

This setup showcases how you can integrate performance-critical or specialized code written in Rust into a Gradio interface.

## Using Gradio with R (via `reticulate`)

Integrating Gradio with R is particularly straightforward thanks to the `reticulate` package, which allows you to run Python code directly in R. Let’s walk through an example of using Gradio in R. 

**Installation**

First, you need to install the `reticulate` package in R:

```r
install.packages("reticulate")
```


Once installed, you can use the package to run Gradio directly from within an R script.


```r
library(reticulate)

py_install("gradio", pip = TRUE)

gr <- import("gradio") # import gradio as gr
```

**Building a Gradio Application**

With gradio installed and imported, we now have access to gradio's app building methods. Let's build a simple app for an R function that returns a greeting

```r
greeting <- \(name) paste("Hello", name)

app <- gr$Interface(
  fn = greeting,
  inputs = gr$Text(label = "Name"),
  outputs = gr$Text(label = "Greeting"),
  title = "Hello! &#128515 &#128075"
)

app$launch(server_name = "localhost", 
           server_port = as.integer(3000))
```

Credit to [@IfeanyiIdiaye](https://github.com/Ifeanyi55) for contributing this section. You can see more examples [here](https://github.com/Ifeanyi55/Gradio-in-R/tree/main/Code), including using Gradio Blocks to build a machine learning application in R.
