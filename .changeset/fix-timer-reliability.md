---
"@gradio/timer": patch
---

fix: Timer not updating reliably after second value change

Fixed an issue where the Timer component's value could not be updated reliably
after the second update. The fix ensures that changes to the timer's interval
value and active state are properly tracked and applied.
