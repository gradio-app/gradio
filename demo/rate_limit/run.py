import gradio as gr
from datetime import datetime, timedelta
from collections import defaultdict
import threading

rate_limit_data = defaultdict(list)
lock = threading.Lock()

UNAUTH_RATE_LIMIT = 3
AUTH_RATE_LIMIT = 30
RATE_LIMIT_WINDOW = 60

def clean_old_entries(user_id):
    """Remove entries older than the rate limit window"""
    current_time = datetime.now()
    cutoff_time = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)
    rate_limit_data[user_id] = [
        timestamp for timestamp in rate_limit_data[user_id]
        if timestamp > cutoff_time
    ]

def get_user_identifier(profile: gr.OAuthProfile | None, request: gr.Request) -> tuple[str, bool]:
    """Get user identifier and whether they're authenticated"""
    if profile is not None:
        return profile.username, True
    else:
        if request:
            return f"ip_{request.client.host}", False
        return "ip_unknown", False

def check_rate_limit(user_id: str, is_authenticated: bool) -> tuple[bool, int, int]:
    """
    Check if user has exceeded rate limit
    Returns: (can_proceed, clicks_used, max_clicks)
    """
    with lock:
        clean_old_entries(user_id)
        
        max_clicks = AUTH_RATE_LIMIT if is_authenticated else UNAUTH_RATE_LIMIT
        clicks_used = len(rate_limit_data[user_id])
        
        can_proceed = clicks_used < max_clicks
        
        return can_proceed, clicks_used, max_clicks

def add_click(user_id: str):
    """Add a click timestamp for the user"""
    with lock:
        rate_limit_data[user_id].append(datetime.now())

def update_status(profile: gr.OAuthProfile | None, request: gr.Request) -> str:
    """Update the status message showing current rate limit info"""
    user_id, is_authenticated = get_user_identifier(profile, request)
    _, clicks_used, max_clicks = check_rate_limit(user_id, is_authenticated)
    
    if is_authenticated:
        return f"✅ You are logged in as '{profile.username}'. You have clicked {clicks_used} times this minute. You have {max_clicks} total clicks per minute."  # type: ignore
    else:
        return f"⚠️ You are not logged in. You have clicked {clicks_used} times this minute. You have {max_clicks} total clicks per minute."

def run_action(profile: gr.OAuthProfile | None, request: gr.Request) -> tuple[str, str]:
    """Handle the run button click with rate limiting"""
    user_id, is_authenticated = get_user_identifier(profile, request)
    can_proceed, clicks_used, max_clicks = check_rate_limit(user_id, is_authenticated)
    
    if not can_proceed:
        result = f"❌ Rate limit exceeded! You've used all {max_clicks} clicks for this minute. Please wait before trying again."
        status = update_status(profile, request)
        return result, status
    
    add_click(user_id)
    
    _, new_clicks_used, _ = check_rate_limit(user_id, is_authenticated)
    
    result = f"✅ Action executed successfully! (Click #{new_clicks_used})"
    status = update_status(profile, request)
    
    return result, status

# Create the Gradio app
with gr.Blocks(title="Rate Limiting Demo") as demo:
    gr.Markdown("# Rate Limiting Demo App")
    gr.Markdown("This app demonstrates rate limiting based on authentication status.")
    
    gr.LoginButton()
    
    status_text = gr.Markdown("Loading status...")
    
    with gr.Row():
        run_btn = gr.Button("🚀 Run Action", variant="primary", scale=1)
    
    result_text = gr.Markdown("")
    
    demo.load(update_status, inputs=None, outputs=status_text)
    
    run_btn.click(
        run_action,
        inputs=None,
        outputs=[result_text, status_text]
    )
    
    gr.Markdown("---")
    gr.Markdown("""
    ### Rate Limits:
    - **Not logged in:** 3 clicks per minute (based on IP address)
    - **Logged in:** 30 clicks per minute (based on HF username)
    
    ### How it works:
    - Click the **Login** button to authenticate with Hugging Face
    - Click the **Run Action** button to test the rate limiting
    - The system tracks your clicks over a rolling 1-minute window
    """)

if __name__ == "__main__":
    demo.launch()
