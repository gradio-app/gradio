from unittest.mock import patch

import huggingface_hub
import pytest

import gradio as gr
from gradio.themes.utils import ThemeAsset, get_matching_version, get_theme_assets

versions = [
    "0.1.0",
    "0.1.1",
    "0.1.2",
    "0.1.3",
    "0.4.4",
    "0.5.0",
    "0.7.0",
    "0.9.2",
    "0.9.3",
    "0.9.4",
    "0.9.5",
    "0.9.6",
    "0.9.7",
    "0.9.8",
    "2.2.0",
    "2.2.1",
    "2.2.10",
    "2.2.11",
    "2.2.12",
    "2.2.13",
    "2.2.14",
    "2.2.15",
    "2.2.2",
    "2.2.3",
    "2.2.4",
    "2.2.5",
    "2.2.6",
    "2.2.7",
    "2.2.8",
    "3.0.1",
    "3.0.10",
    "3.0.11",
    "3.0.12",
    "3.0.13",
    "3.0.14",
    "3.0.15",
    "3.0.16",
    "3.0.17",
    "3.0.18",
    "3.0.19",
    "3.0.2",
    "3.0.20",
    "3.0.20-dev0",
    "3.0.21",
    "3.0.22",
    "3.0.23",
    "3.0.23-dev1",
    "3.0.24",
    "3.0.25",
    "3.0.26",
    "3.0.3",
    "3.0.4",
    "3.0.5",
    "3.0.6",
    "3.0.7",
    "3.0.8",
    "3.0.9",
    "3.1.0",
    "3.1.1",
    "3.1.2",
    "3.1.3",
    "3.1.4",
    "3.1.5",
    "3.1.6",
    "3.1.7",
    "3.10.0",
    "3.10.1",
    "3.11.0",
    "3.12.0",
    "3.13.0",
    "3.13.1",
    "3.13.2",
    "3.14.0",
    "3.15.0",
    "3.16.0",
    "3.16.1",
    "3.16.2",
    "3.17.0",
    "3.17.1",
    "3.18.0",
    "3.18.1",
    "3.18.1-dev0",
    "3.18.2-dev0",
    "3.18.2",
    "3.19.0",
    "3.19.1",
    "3.20.0",
    "3.20.1",
    "3.3.1",
    "3.4.1",
    "3.8.1",
    "3.8.2",
    "3.9.1",
]


assets = [ThemeAsset(f"theme_schema@{version}") for version in versions]

dracula_gray = gr.themes.colors.Color(
    *(
        ["#6272a4", "#7280ad", "#818eb6", "#919cbf", "#a1aac8"][::-1]
        + ["#586794", "#4e5b83", "#455073", "#3b4462", "#313952", "#272e42"]
    )
)

dracula = gr.themes.Base(
    primary_hue=gr.themes.colors.pink, neutral_hue=dracula_gray
).set(
    body_text_color="#f8f8f2",
    body_text_color_dark="#f8f8f2",
    block_label_color="#f8f8f2",
    block_label_color_dark="#f8f8f2",
    block_info_color_dark="#f8f8f2",
    block_title_color="#f8f8f2",
    block_title_color_dark="#f8f8f2",
    checkbox_background_selected_dark="#ff79c6",
    button_primary_background_dark="#ff79c6",
    slider_color_dark="#ff79c6",
)


class TestSemverMatch:
    def test_simple_equality(self):
        assert get_matching_version(assets, "3.10.0") == ThemeAsset(
            "theme_schema@3.10.0"
        )

    def test_empty_expression_returns_latest(self):
        assert get_matching_version(assets, None) == ThemeAsset("theme_schema@3.20.1")

    def test_range(self):
        assert get_matching_version(assets, ">=3.10.0,<3.15") == ThemeAsset(
            "theme_schema@3.14.0"
        )

    def test_wildcard(self):
        assert get_matching_version(assets, "2.2.*") == ThemeAsset(
            "theme_schema@2.2.15"
        )

    def test_does_not_exist(self):
        assert get_matching_version(assets, ">4.0.0") is None

    def test_compatible_release_specifier(self):
        assert get_matching_version(assets, "~=0.0") == ThemeAsset("theme_schema@0.9.8")

    def test_breaks_ties_against_prerelease(self):
        assert get_matching_version(assets, ">=3.18,<3.19") == ThemeAsset(
            "theme_schema@3.18.2"
        )


class TestGetThemeAssets:
    def test_get_theme_assets(self):

        space_info = huggingface_hub.hf_api.SpaceInfo(
            id="freddyaboulton/dracula",
            siblings=[
                {
                    "blob_id": None,
                    "lfs": None,
                    "rfilename": "themes/theme_schema@0.1.0.json",
                    "size": None,
                },
                {
                    "blob_id": None,
                    "lfs": None,
                    "rfilename": "themes/theme_schema@0.1.1.json",
                    "size": None,
                },
                {
                    "blob_id": None,
                    "lfs": None,
                    "rfilename": "themes/theme_schema@0.2.5.json",
                    "size": None,
                },
                {
                    "blob_id": None,
                    "lfs": None,
                    "rfilename": "themes/theme_schema@1.5.9.json",
                    "size": None,
                },
            ],
            tags=["gradio-theme", "gradio"],
        )

        with patch("huggingface_hub.HfApi.space_info", return_value=space_info):
            assert get_theme_assets("freddyaboulton/dracula") == [
                ThemeAsset("themes/theme_schema@0.1.0.json"),
                ThemeAsset("themes/theme_schema@0.1.1.json"),
                ThemeAsset("themes/theme_schema@0.2.5.json"),
                ThemeAsset("themes/theme_schema@1.5.9.json"),
            ]

    def test_raises_if_space_not_properly_tagged(self):
        space_info = huggingface_hub.hf_api.SpaceInfo(
            id="freddyaboulton/dracula", tags=["gradio"]
        )

        with pytest.raises(
            ValueError,
            match="freddyaboulton/dracula is not a valid gradio-theme space!",
        ):
            with patch("huggingface_hub.HfApi.space_info", return_value=space_info):
                get_theme_assets("freddyaboulton/dracula")


class TestThemeUploadDownload:
    @pytest.mark.flaky
    def test_theme_download(self):

        assert (
            gr.themes.Base.from_hub("freddyaboulton/dracula_revamped@0.1.1").to_dict()
            == dracula.to_dict()
        )

        with gr.Blocks(theme="freddyaboulton/dracula_revamped") as demo:
            pass

        assert demo.theme.to_dict() == dracula.to_dict()

    def test_upload_fails_if_not_valid_semver(self):
        with pytest.raises(ValueError, match="Invalid version string: '3.0'"):
            dracula.push_to_hub("dracula_revamped", version="3.0", hf_token="s")
