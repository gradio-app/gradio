import { Container, Sprite, Graphics } from "pixi.js";

/**
 * Sets the cursor style for a single PIXI object.
 * @param child - The PIXI object to set the cursor for.
 * @param cursor - The cursor style to set.
 */
export function set_cursor(
	child: Container | Sprite | Graphics,
	cursor: "unset" | "none"
): void {
	if (child instanceof Container) {
		child.cursor = cursor;
	} else if ("cursor" in child) {
		(child as any).cursor = cursor;
	}
}

/**
 * Recursively sets the cursor style for PIXI objects.
 * @param children - The PIXI objects to set the cursor for.
 * @param cursor - The cursor style to set.
 */
export function recurse_set_cursor(
	children: (Container | Sprite | Graphics)[],
	cursor: "unset" | "none"
): void {
	for (const child of children) {
		set_cursor(child, cursor);
		if (child instanceof Container && child.children.length > 0) {
			recurse_set_cursor(
				child.children as (Container | Sprite | Graphics)[],
				cursor
			);
		}
	}
}

/**
 * Safely removes a child from its parent.
 * @param child - The child to remove.
 */
export function safe_remove_child(
	child: Container | Sprite | Graphics | null
): void {
	if (child && child.parent) {
		child.parent.removeChild(child);
	}
}

/**
 * Safely destroys a PIXI object and nullifies it.
 * @param obj - The object to destroy.
 * @returns null to assist with nullifying the reference.
 */
export function safe_destroy<T extends { destroy: (options?: any) => void }>(
	obj: T | null
): null {
	if (obj) {
		safe_remove_child(obj as any);
		obj.destroy({ children: true });
	}
	return null;
}

/**
 * Clears a timeout safely and nullifies the reference.
 * @param timeout - The timeout to clear.
 * @returns null to assist with nullifying the reference.
 */
export function clear_timeout(timeout: number | null): null {
	if (timeout !== null) {
		window.clearTimeout(timeout);
	}
	return null;
}
