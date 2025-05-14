import { writable, type Writable } from "svelte/store";

/**
 * Base command interface that is added to the command_managers history
 */
export interface Command {
	/**
	 * Optionally called when the command is first executed for multi-step commands
	 * @param args arguments to pass to the command
	 */
	start?: (...args: any) => any | Promise<any>;
	/**
	 * Optionally called when the command is continued for multi-step commands
	 * @param args arguments to pass to the command
	 */
	continue?: (...args: any) => any | Promise<any>;
	/**
	 * Optionally called when the command is stopped for multi-step commands
	 * @param args arguments to pass to the command
	 */
	stop?: (...args: any) => any | Promise<any>;
	/**
	 * Called by the command manager to execute the command, can act as a no-op if the work has already been done
	 * This function must be able to recreate the command if the command is undone and redone (`stop`/`start`/`continue` will not be called again)
	 */
	execute(): any | Promise<any>;
	/**
	 * Called by the command manager to undo the command
	 * This function must be able to undo the work done by the execute function
	 */
	undo(): any | Promise<any>;
}

/**
 * Command manager interface that handles the undo/redo history
 */
// export interface CommandManager {
// 	/**
// 	 * Undo the last command
// 	 */
// 	undo(): void;
// 	/**
// 	 * Redo the last undone command
// 	 */
// 	redo(): void;
// 	/**
// 	 * Execute a command and add it to the history
// 	 * @param command command to execute
// 	 */
// 	execute(command: Command): void;
// 	/**
// 	 * Whether or not there are commands that can be undone
// 	 * Observable store that you can subscribe to for updates
// 	 */
// 	readonly can_undo: Writable<boolean>;
// 	/**
// 	 * Whether or not there are commands that can be redone
// 	 * Observable store that you can subscribe to for updates
// 	 */
// 	readonly can_redo: Writable<boolean>;
// 	/**
// 	 * Resets the history
// 	 */
// 	reset(): void;
// 	/**
// 	 * The current history node
// 	 * Observable store that you can subscribe to for updates
// 	 */
// 	readonly current_history: Writable<CommandNode>;
// 	/**
// 	 * Hydrates the command manager with a full history
// 	 * @param full_history the full history to hydrate with
// 	 */
// 	hydrate(full_history: CommandNode): void;
// }

/**
 * Creates a command node
 * @param command command to add to the node
 * @returns a command node
 */
export class CommandNode {
	command: Command | null;
	next: CommandNode | null;
	previous: CommandNode | null;

	constructor(command?: Command) {
		this.command = command || null;
		this.next = null;
		this.previous = null;
	}

	push(command: Command): void {
		const node = new CommandNode(command);
		node.previous = this;
		this.next = node;
	}
}

/**
 * Creates a command manager
 * @returns a command manager
 */
export class CommandManager {
	history: CommandNode = new CommandNode();

	current_history = writable(this.history);

	undo(): void {
		if (this.history.previous) {
			this.history.command?.undo();
			this.history = this.history.previous;

			this.current_history.set(this.history);
		}
	}
	redo(): void {
		if (this.history.next) {
			this.history = this.history.next;
			this.history.command?.execute();
		}

		this.current_history.set(this.history);
	}

	execute(command: Command): void {
		command.execute();
		this.history.push(command);
		this.history = this.history.next!;

		this.current_history.set(this.history);
		console.log("CommandManager::execute", this.history);
	}

	replay(full_history: CommandNode): void {
		setTimeout(() => {
			while (full_history.next) {
				this.execute(full_history.next.command!);
				full_history = full_history.next;
			}
		}, 1000);
	}

	reset(): void {
		this.history = new CommandNode();

		this.current_history.set(this.history);
	}
}
