import os
import sys

from huggingface_hub import list_spaces, restart_space


def main():
    """Restart all non-running Spaces in the gradio-tests organization."""
    org_name = "gradio-tests"

    print(f"Fetching all Spaces from {org_name} organization...")

    try:
        spaces = list(list_spaces(author=org_name, full=True))
        print(f"Found {len(spaces)} Spaces in {org_name}")

        restarted_count = 0
        already_running = 0
        failed_restarts = []

        for space in spaces:
            space_id = f"{org_name}/{space.id.split('/')[-1]}"
            runtime = space.runtime

            if runtime and hasattr(runtime, "stage") and runtime.stage == "RUNNING":
                already_running += 1
                print(f"✓ {space_id} is already RUNNING")
            else:
                current_stage = (
                    runtime.stage
                    if runtime and hasattr(runtime, "stage")
                    else "UNKNOWN"
                )
                print(f"✗ {space_id} is {current_stage}, attempting to restart...")

                try:
                    restart_space(space_id)
                    restarted_count += 1
                    print(f"  → Successfully requested restart for {space_id}")
                except Exception as e:
                    failed_restarts.append((space_id, str(e)))
                    print(f"  → Failed to restart {space_id}: {e}")

        # Print summary
        print("\n" + "=" * 50)
        print("SUMMARY:")
        print(f"Total Spaces: {len(spaces)}")
        print(f"Already running: {already_running}")
        print(f"Successfully restarted: {restarted_count}")
        print(f"Failed to restart: {len(failed_restarts)}")

        if failed_restarts:
            print("\nFailed restarts:")
            for space_id, error in failed_restarts:
                print(f"  - {space_id}: {error}")

    except Exception as e:
        print(f"Error accessing Spaces in {org_name}: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if not os.environ.get("HF_TOKEN") and not os.environ.get("HUGGING_FACE_HUB_TOKEN"):
        print("Warning: No HuggingFace token found in environment.")
        print("Set HF_TOKEN or HUGGING_FACE_HUB_TOKEN to authenticate.")
        print("Some operations may fail without authentication.\n")

    main()
