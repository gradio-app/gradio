type $$ComponentProps = {
    fullscreen: boolean;
    onclick: (fullscreen: boolean) => void;
};
declare const FullscreenButton: import("svelte").Component<$$ComponentProps, {}, "">;
type FullscreenButton = ReturnType<typeof FullscreenButton>;
export default FullscreenButton;
