import { test, describe, expect, vi, afterEach } from "vitest";
import { spy, spyOn } from "tinyspy";
import { cleanup, render, wait_for_event, wait, fireEvent } from "@gradio/tootils";
import event from "@testing-library/user-event";
import { setupi18n } from "../../i18n";
import type { LoadingStatus } from "../StatusTracker/types";
import UploadButton from "./UploadButton.svelte";

const loading_status = {
    eta: 0,
    queue_position: 1,
    queue_size: 1,
    status: "complete" as LoadingStatus["status"],
    scroll_to_output: false,
    visible: true,
    fn_index: 0
};


describe("UploadButton", () => {

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test("Uploads with blob", async () => {

        vi.mock("@gradio/client", async () => {
            return {
                upload_files: vi.fn((f) => new Promise((res) => res({}))) //(f) => new Promise((res) => res({})) //vi.fn((f) => new Promise((res) => res({})))
            };
        });

        const api = await import("@gradio/client");

        setupi18n();

        //const upload_mock = spyOn(api, 'upload_files');

        const { container } = await render(UploadButton, {
            loading_status,
            label: "file",
            // @ts-ignore
            value: { name: "freddy.json", data: "{'name': 'freddy'}", blob: vi.fn() },
            show_label: true,
            mode: "dynamic",
            root: "http://localhost:7860",
            file_count: "1",
            root_url: null
        });

        const item = container.querySelectorAll("input")[0];
        console.log(item);
        const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
        item.files = new FileList([file]);
        //await event.load(item, file);
        await fireEvent.change(item);
        //await wait(4000);
        expect(api.upload_files).toHaveBeenCalled();
    });

    // test("renders provided value and label", async () => {
    //     setupi18n();
    //     const { getByTestId, queryAllByText } = await render(UploadButton, {
    //         mode: "dynamic",
    //         value: null,
    //         label: "UploadButton Component",
    //         root: "foo",
    //         file_count: "single"
    //     });
    // });

    // test("hides label", async () => {
    //     const { queryAllByText } = await render(Audio, {
    //         show_label: false,
    //         loading_status,
    //         mode: "dynamic",
    //         value: {
    //             name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
    //             data: null,
    //             is_file: true
    //         },
    //         label: "Audio Component",
    //         root: "foo",
    //         root_url: null,
    //         streaming: false,
    //         pending: false,
    //         name: "bar",
    //         source: "upload"
    //     });

    //     assert(queryAllByText("Audio Component").length, 0);
    // });

    // test("upload sets change event", async () => {
    //     setupi18n();
    //     const { container, component } = await render(Audio, {
    //         show_label: false,
    //         loading_status,
    //         value: null,
    //         mode: "dynamic",
    //         label: "audio",
    //         root: "foo",
    //         root_url: null,
    //         streaming: false,
    //         name: "bar",
    //         source: "upload"
    //     });

    //     const item = container.querySelectorAll("input")[0];
    //     const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
    //     event.upload(item, file);
    //     const mock = await wait_for_event(component, "change");
    //     assert.equal(mock.callCount, 1);
    //     assert.equal(
    //         component.$capture_state().value.data,
    //         "data:audio/wav;base64,aGVsbG8="
    //     );
    //     assert.equal(component.$capture_state().value.name, "my-audio.wav");
    // });

    // test("static audio sets value", async () => {
    //     const { getByTestId } = await render(Audio, {
    //         show_label: true,
    //         loading_status,
    //         mode: "static",
    //         value: {
    //             name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
    //             data: null,
    //             is_file: true
    //         },
    //         label: "Audio Component",
    //         root: "foo",
    //         root_url: null,
    //         streaming: false,
    //         pending: false,
    //         name: "bar",
    //         source: "upload"
    //     });

    //     assert.isTrue(
    //         getByTestId("Audio Component-audio").src.endsWith(
    //             "foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
    //         )
    //     );
    // });

});
