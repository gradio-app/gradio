import gradio as gr

def prime_factors(n: str):
    """
    Compute the prime factorization of a positive integer.

    Args:
        n (str): The integer to factorize. Must be greater than 1.
    """
    n_int = int(n)
    if n_int <= 1:
        return [1]

    factors = []
    while n_int % 2 == 0:
        factors.append(2)
        n_int //= 2

    divisor = 3
    while divisor * divisor <= n_int:
        while n_int % divisor == 0:
            factors.append(divisor)
            n_int //= divisor
        divisor += 2

    if n_int > 1:
        factors.append(n_int)

    return factors

demo = gr.Interface(
    fn=prime_factors,
    inputs=gr.Textbox(label="Number"),
    outputs=gr.Textbox(label="Factors"),
    api_name="predict",
)

if __name__ == "__main__":
    demo.launch(mcp_server=True, mcp_app=True, share=True, strict_cors=False)