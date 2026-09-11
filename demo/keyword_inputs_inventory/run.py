from typing import Any

import gradio as gr


INVENTORY: list[dict[str, Any]] = [
    {"name": "Studio Headphones", "category": "Audio", "price": 149, "stock": 18},
    {"name": "Podcast Microphone", "category": "Audio", "price": 89, "stock": 0},
    {
        "name": "Mechanical Keyboard",
        "category": "Accessories",
        "price": 129,
        "stock": 7,
    },
    {"name": "Ergonomic Mouse", "category": "Accessories", "price": 79, "stock": 24},
    {"name": "4K Monitor", "category": "Displays", "price": 499, "stock": 5},
    {"name": "Portable Monitor", "category": "Displays", "price": 219, "stock": 0},
    {"name": "Developer Laptop", "category": "Computers", "price": 1599, "stock": 3},
    {"name": "Mini Desktop", "category": "Computers", "price": 749, "stock": 11},
    {"name": "USB-C Dock", "category": "Accessories", "price": 189, "stock": 14},
    {"name": "Conference Speaker", "category": "Audio", "price": 249, "stock": 6},
]


def filter_inventory(
    query: str,
    *,
    category: str,
    max_price: float,
    in_stock_only: bool,
    sort_by: str,
    result_limit: int,
) -> tuple[list[list[Any]], str]:
    """Filter a product catalog while keeping every option explicit and named."""
    normalized_query = query.strip().lower()
    matches = [
        item
        for item in INVENTORY
        if (not normalized_query or normalized_query in item["name"].lower())
        and (category == "All" or item["category"] == category)
        and item["price"] <= max_price
        and (not in_stock_only or item["stock"] > 0)
    ]

    if sort_by == "Price: low to high":
        matches.sort(key=lambda item: item["price"])
    elif sort_by == "Price: high to low":
        matches.sort(key=lambda item: item["price"], reverse=True)
    else:
        matches.sort(key=lambda item: item["name"])

    visible_matches = matches[: int(result_limit)]
    rows = [
        [item["name"], item["category"], item["price"], item["stock"]]
        for item in visible_matches
    ]
    status = (
        f"Showing **{len(visible_matches)}** of **{len(matches)}** matching products."
    )
    return rows, status


with gr.Blocks() as demo:
    gr.Markdown(
        "# Inventory explorer\n"
        "Search and filter a catalog with controls mapped to named function parameters."
    )
    search = gr.Textbox(label="Search", placeholder="Try 'monitor' or 'audio'")
    with gr.Row():
        category = gr.Dropdown(
            ["All", "Accessories", "Audio", "Computers", "Displays"],
            value="All",
            label="Category",
        )
        max_price = gr.Slider(0, 2000, value=2000, step=25, label="Maximum price")
        in_stock_only = gr.Checkbox(value=False, label="In stock only")
    with gr.Row():
        sort_by = gr.Dropdown(
            ["Name", "Price: low to high", "Price: high to low"],
            value="Name",
            label="Sort by",
        )
        result_limit = gr.Slider(1, 10, value=10, step=1, label="Result limit")

    results = gr.Dataframe(
        headers=["Product", "Category", "Price ($)", "In stock"],
        datatype=["str", "str", "number", "number"],
        interactive=False,
    )
    status = gr.Markdown()

    gr.on(
        fn=filter_inventory,
        inputs=[search],
        inputs_kwargs={
            "category": category,
            "in_stock_only": in_stock_only,
            "max_price": max_price,
            "result_limit": result_limit,
            "sort_by": sort_by,
        },
        outputs=[results, status],
        trigger_mode="always_last",
    )


if __name__ == "__main__":
    demo.launch()
