import type { Meta, StoryObj } from "@storybook/svelte";
import I18nMultiLanguageTestComponent from "./I18nMultiLanguageTestComponent.svelte";

const meta = {
	title: "Core/I18n Multi-Language Test",
	component: I18nMultiLanguageTestComponent,
	parameters: {
		layout: "centered"
	}
} satisfies Meta<I18nMultiLanguageTestComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {}
};
