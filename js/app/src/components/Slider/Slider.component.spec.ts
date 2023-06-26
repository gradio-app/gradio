import { test, expect } from '@playwright/experimental-ct-svelte';
import Slider from "./Slider.svelte";

test('should work', async ({ mount }) => {
    // <Slider value=3 minimum = 0 maximum = 10 step = 1 label = "My Slider" show_label = true />
    const component = await mount(Slider, { props: { value: 3, minimum: 0, maximum: 10, label: "My Slider", show_label: true } });
    await expect(component).toContainText('My Slidersss');
});