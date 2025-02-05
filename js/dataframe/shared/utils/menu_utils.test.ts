import { describe, test, expect, vi } from "vitest";
import {
	toggle_header_menu,
	toggle_cell_menu,
	add_row_at,
	add_col_at,
	delete_row_at,
	delete_col_at,
	toggle_header_button,
	toggle_cell_button
} from "./menu_utils";

describe("menu_utils", () => {
	describe("toggle_header_menu", () => {
		test("opens header menu when closed", () => {
			const setActiveHeaderMenu = vi.fn();
			const event = {
				stopPropagation: vi.fn(),
				target: document.createElement("th")
			} as unknown as MouseEvent;

			toggle_header_menu(event, 1, null, setActiveHeaderMenu);

			expect(event.stopPropagation).toHaveBeenCalled();
			expect(setActiveHeaderMenu).toHaveBeenCalledWith(
				expect.objectContaining({
					col: 1
				})
			);
		});

		test("closes header menu when open", () => {
			const setActiveHeaderMenu = vi.fn();
			const event = {
				stopPropagation: vi.fn(),
				target: document.createElement("th")
			} as unknown as MouseEvent;
			const active_menu = { col: 1, x: 0, y: 0 };

			toggle_header_menu(event, 1, active_menu, setActiveHeaderMenu);

			expect(setActiveHeaderMenu).toHaveBeenCalledWith(null);
		});
	});

	describe("toggle_cell_menu", () => {
		test("opens cell menu when closed", () => {
			const setActiveCellMenu = vi.fn();
			const event = {
				stopPropagation: vi.fn(),
				target: document.createElement("td")
			} as unknown as MouseEvent;

			toggle_cell_menu(event, 1, 2, null, setActiveCellMenu);

			expect(event.stopPropagation).toHaveBeenCalled();
			expect(setActiveCellMenu).toHaveBeenCalledWith(
				expect.objectContaining({
					row: 1,
					col: 2
				})
			);
		});

		test("closes cell menu when open", () => {
			const setActiveCellMenu = vi.fn();
			const event = {
				stopPropagation: vi.fn(),
				target: document.createElement("td")
			} as unknown as MouseEvent;
			const active_menu = { row: 1, col: 2, x: 0, y: 0 };

			toggle_cell_menu(event, 1, 2, active_menu, setActiveCellMenu);

			expect(setActiveCellMenu).toHaveBeenCalledWith(null);
		});
	});

	describe("add_row_at", () => {
		test("adds row above", () => {
			const add_row = vi.fn();
			const clearMenus = vi.fn();

			add_row_at(1, "above", add_row, clearMenus);

			expect(add_row).toHaveBeenCalledWith(1);
			expect(clearMenus).toHaveBeenCalled();
		});

		test("adds row below", () => {
			const add_row = vi.fn();
			const clearMenus = vi.fn();

			add_row_at(1, "below", add_row, clearMenus);

			expect(add_row).toHaveBeenCalledWith(2);
			expect(clearMenus).toHaveBeenCalled();
		});
	});

	describe("add_col_at", () => {
		test("adds column to the left", () => {
			const add_col = vi.fn();
			const clearMenus = vi.fn();

			add_col_at(1, "left", add_col, clearMenus);

			expect(add_col).toHaveBeenCalledWith(1);
			expect(clearMenus).toHaveBeenCalled();
		});

		test("adds column to the right", () => {
			const add_col = vi.fn();
			const clearMenus = vi.fn();

			add_col_at(1, "right", add_col, clearMenus);

			expect(add_col).toHaveBeenCalledWith(2);
			expect(clearMenus).toHaveBeenCalled();
		});
	});

	describe("delete operations", () => {
		test("deletes row", () => {
			const delete_row = vi.fn();
			const clearMenus = vi.fn();

			delete_row_at(1, delete_row, clearMenus);

			expect(delete_row).toHaveBeenCalledWith(1);
			expect(clearMenus).toHaveBeenCalled();
		});

		test("deletes column", () => {
			const delete_col = vi.fn();
			const clearMenus = vi.fn();

			delete_col_at(1, delete_col, clearMenus);

			expect(delete_col).toHaveBeenCalledWith(1);
			expect(clearMenus).toHaveBeenCalled();
		});
	});

	describe("button toggles", () => {
		test("toggles header button", () => {
			const setActiveButton = vi.fn();

			toggle_header_button(1, null, setActiveButton);
			expect(setActiveButton).toHaveBeenCalledWith({ type: "header", col: 1 });

			toggle_header_button(1, { type: "header", col: 1 }, setActiveButton);
			expect(setActiveButton).toHaveBeenCalledWith(null);
		});

		test("toggles cell button", () => {
			const setActiveButton = vi.fn();

			toggle_cell_button(1, 2, null, setActiveButton);
			expect(setActiveButton).toHaveBeenCalledWith({
				type: "cell",
				row: 1,
				col: 2
			});

			toggle_cell_button(
				1,
				2,
				{ type: "cell", row: 1, col: 2 },
				setActiveButton
			);
			expect(setActiveButton).toHaveBeenCalledWith(null);
		});
	});
});
