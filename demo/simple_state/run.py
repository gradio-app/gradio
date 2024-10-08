import gradio as gr

with gr.Blocks() as demo:
    cart = gr.State([])
    items_to_add = gr.CheckboxGroup(["Cereal", "Milk", "Orange Juice", "Water"])

    def add_items(new_items, previous_cart):
        cart = previous_cart + new_items
        return cart

    gr.Button("Add Items").click(add_items, [items_to_add, cart], cart)

    cart_size = gr.Number(label="Cart Size")
    cart.change(lambda cart: len(cart), cart, cart_size)

if __name__ == "__main__":
    demo.launch()