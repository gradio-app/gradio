"""Demo showcasing runtime gr.cache(fn)(...) for an intermediate helper call."""

import re
import time

import gradio as gr

POLICIES = {
    "Billing": [
        {
            "title": "Refund windows",
            "text": "Customers can request a refund within 30 days of purchase. "
            "Annual subscriptions can be prorated if the request arrives after the "
            "first 30 days but before day 90.",
        },
        {
            "title": "Invoice corrections",
            "text": "Billing agents can correct invoice email addresses, company "
            "names, and tax identifiers, but cannot alter the purchase date.",
        },
        {
            "title": "Duplicate charges",
            "text": "If two charges appear within 24 hours for the same plan and "
            "customer account, billing should confirm card fingerprint and issue a "
            "same-day reversal.",
        },
    ],
    "IT": [
        {
            "title": "Password resets",
            "text": "IT can revoke all active sessions and force a password reset "
            "after verifying the employee through the HR directory.",
        },
        {
            "title": "VPN access",
            "text": "New VPN access is approved only for employees with manager "
            "approval and a registered MFA device.",
        },
        {
            "title": "Laptop replacement",
            "text": "Broken laptops should be tagged with the device asset number "
            "and shipped to the repair center before a replacement is issued.",
        },
    ],
    "HR": [
        {
            "title": "Parental leave",
            "text": "Full-time employees are eligible for 16 weeks of paid parental "
            "leave after six months of employment.",
        },
        {
            "title": "Address changes",
            "text": "Employees should update their home address in the HR portal "
            "before payroll closes on the 20th of each month.",
        },
        {
            "title": "Interview scheduling",
            "text": "Recruiters should provide interview panels at least 48 hours "
            "to review candidate materials before the session starts.",
        },
    ],
}

TONE_PREFIX = {
    "Concise": "Give a short answer.",
    "Friendly": "Give a warm, helpful answer.",
    "Formal": "Give a professional and policy-focused answer.",
}


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def retrieve_passages(question: str, team: str) -> list[dict[str, str | int]]:
    """Pretend retrieval is the expensive deterministic step."""
    time.sleep(2)
    query_tokens = _tokens(question)
    ranked = []
    for doc in POLICIES[team]:
        combined_text = f"{doc['title']} {doc['text']}"
        score = len(query_tokens & _tokens(combined_text))
        ranked.append(
            {
                "title": doc["title"],
                "text": doc["text"],
                "score": score,
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked[:2]


def draft_answer(question: str, team: str, tone: str) -> tuple[str, str, str]:
    start = time.time()

    passages = gr.cache(retrieve_passages)(question, team)
    top_match = passages[0]
    bullets = "\n".join(
        f"- {match['title']}: {match['text']}" for match in passages
    )

    answer = (
        f"{TONE_PREFIX[tone]}\n\n"
        f"For a {team.lower()} request about '{question}', the strongest match is "
        f"**{top_match['title']}**.\n\n"
        f"Suggested reply: Based on the current {team.lower()} policy, {top_match['text']}"
    )
    debug = (
        f"Retrieved {len(passages)} passages in {time.time() - start:.2f}s.\n"
        "Try the same question twice, or change only the tone. "
        "The retrieval helper should be reused from cache."
    )
    return answer, bullets, debug


with gr.Blocks(title="Intermediate gr.cache() Demo") as demo:
    gr.Markdown(
        "# Intermediate `gr.cache()` Demo\n"
        "This simulates a support assistant where the **retrieval** step is expensive "
        "but deterministic, while the final answer still recomputes. "
        "Submit the same question twice, or change only the tone, and watch Gradio "
        "show the `used cache` badge when the cached helper is reused."
    )

    with gr.Row():
        with gr.Column():
            team = gr.Dropdown(
                choices=list(POLICIES.keys()),
                value="Billing",
                label="Team",
            )
            tone = gr.Dropdown(
                choices=["Concise", "Friendly", "Formal"],
                value="Friendly",
                label="Answer style",
            )
            question = gr.Textbox(
                label="Customer question",
                lines=3,
                value="Can this customer get a refund after being charged twice?",
            )
            draft = gr.Markdown()
            retrieved = gr.Markdown()
            debug = gr.Textbox(label="Debug", lines=3)
            gr.Button("Draft reply").click(
                draft_answer,
                [question, team, tone],
                outputs=[draft, retrieved, debug],
            )


if __name__ == "__main__":
    demo.launch()
