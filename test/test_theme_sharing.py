import tempfile
from unittest.mock import patch

import huggingface_hub
import pytest
from huggingface_hub.hf_api import SpaceInfo

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


dracula_pink = gr.themes.Color(
    *(
        [
            "#ffd7ee",
            "#ff79c6",
            "#ff86cc",
            "#ff94d1",
            "#ffa1d7",
            "#ffafdd",
            "#ffbce3",
            "#ffc9e8",
        ][::-1]
        + ["#e66db2", "#cc619e", "#b3558b"]
    )
)

dracula_gray = gr.themes.colors.Color(
    *(
        ["#6272a4", "#7280ad", "#818eb6", "#919cbf", "#a1aac8"][::-1]
        + ["#586794", "#4e5b83", "#455073", "#3b4462", "#313952", "#272e42"]
    )
)

dracula = gr.themes.Base(
    primary_hue=gr.themes.colors.pink,
    neutral_hue=dracula_gray,
    font=gr.themes.GoogleFont("Poppins"),
).set(
    body_background_fill=dracula_gray.c500,
    color_accent_soft=dracula_gray.c100,
    error_border_color="#fecaca",
    error_background_fill="#fee2e2",
    error_icon_color="#b91c1c",
    error_icon_color_dark="#ef4444",
    error_text_color="#ef4444",
    error_text_color_dark="#ef4444",
    background_fill_primary=dracula_gray.c500,
    background_fill_secondary=dracula_gray.c500,
    block_background_fill=dracula_gray.c300,
    body_text_color="#f8f8f2",
    body_text_color_dark="#f8f8f2",
    body_text_color_subdued="#f8f8f2",
    block_label_text_color="#f8f8f2",
    block_label_text_color_dark="#f8f8f2",
    table_even_background_fill=dracula_gray.c300,
    border_color_accent=dracula_gray.c200,
    block_info_text_color="#f8f8f2",
    block_info_text_color_dark="#f8f8f2",
    block_title_text_color="#f8f8f2",
    block_title_text_color_dark="#f8f8f2",
    checkbox_background_color_selected_dark="#ff79c6",
    checkbox_background_color_selected="#ff79c6",
    button_primary_background_fill_dark="#ff79c6",
    button_primary_background_fill=dracula_pink.c300,
    button_secondary_text_color="#f8f8f2",
    slider_color_dark="#ff79c6",
    slider_color=dracula_pink.c300,
    panel_background_fill="#31395294",
    block_background_fill_dark="#31395294",
)
dracula.name = "gradio/dracula_test"


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

        assert get_theme_assets(space_info) == [
            ThemeAsset("themes/theme_schema@0.1.0.json"),
            ThemeAsset("themes/theme_schema@0.1.1.json"),
            ThemeAsset("themes/theme_schema@0.2.5.json"),
            ThemeAsset("themes/theme_schema@1.5.9.json"),
        ]

        assert gr.Theme._theme_version_exists(space_info, "0.1.1")
        assert not gr.Theme._theme_version_exists(space_info, "2.0.0")

    @pytest.mark.flaky
    def test_load_space_from_hub_works(self):
        theme = gr.Theme.from_hub("gradio/seafoam")
        assert isinstance(theme, gr.Theme)

    # def test_raises_if_space_not_properly_tagged(self):
    #     space_info = huggingface_hub.hf_api.SpaceInfo(
    #         id="freddyaboulton/dracula", tags=["gradio"]
    #     )

    #     with pytest.raises(
    #         ValueError,
    #         match="freddyaboulton/dracula is not a valid gradio-theme space!",
    #     ):
    #         with patch("huggingface_hub.HfApi.space_info", return_value=space_info):
    #             get_theme_assets(space_info)


class TestBuiltInThemes:
    @pytest.mark.parametrize(
        "theme, name",
        [
            (gr.themes.Base(), "base"),
            (gr.themes.Glass(), "glass"),
            (gr.themes.Monochrome(), "monochrome"),
            (gr.themes.Soft(), "soft"),
            (gr.themes.Default(), "default"),
        ],
    )
    def test_theme_name(self, theme, name):
        assert theme.name == name


class TestThemeUploadDownload:
    @patch("gradio.themes.base.get_theme_assets", return_value=assets)
    def test_get_next_version(self, mock):
        next_version = gr.themes.Base._get_next_version(
            SpaceInfo(id="gradio/dracula_test")
        )
        assert next_version == "3.20.2"

    ## Commenting out until after 4.0 Spaces are up
    # @pytest.mark.flaky
    # def test_theme_download(self):
    #     assert (
    #         gr.themes.Base.from_hub("gradio/dracula_test@0.0.2").to_dict()
    #         == dracula.to_dict()
    #     )

    #     with gr.Blocks(theme="gradio/dracula_test@0.0.2") as demo:
    #         pass

    #     assert demo.theme.to_dict() == dracula.to_dict()
    #     assert demo.theme.name == "gradio/dracula_test"

    def test_theme_download_raises_error_if_theme_does_not_exist(self):
        with pytest.raises(
            ValueError, match="The space freddyaboulton/nonexistent does not exist"
        ):
            gr.themes.Base.from_hub("freddyaboulton/nonexistent").to_dict()

    @patch("gradio.themes.base.huggingface_hub")
    @patch("gradio.themes.base.Base._theme_version_exists", return_value=True)
    def test_theme_upload_fails_if_duplicate_version(self, mock_1, mock_2):
        with pytest.raises(ValueError, match="already has a theme with version 0.2.1"):
            dracula.push_to_hub("dracula_revamped", version="0.2.1", hf_token="foo")

    @patch("gradio.themes.base.huggingface_hub")
    @patch("gradio.themes.base.huggingface_hub.HfApi")
    def test_upload_fails_if_not_valid_semver(self, mock_1, mock_2):
        with pytest.raises(ValueError, match="Invalid version string: '3.0'"):
            dracula.push_to_hub("dracula_revamped", version="3.0", hf_token="s")

    def test_dump_and_load(self):
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as path:
            dracula.dump(path.name)
            assert gr.themes.Base.load(path.name).to_dict() == dracula.to_dict()

    @patch("gradio.themes.base.Base._get_next_version", return_value="0.1.3")
    @patch("gradio.themes.base.Base._theme_version_exists", return_value=False)
    @patch("gradio.themes.base.huggingface_hub")
    def test_version_and_token_optional(self, mock_1, mock_2, mock_3):
        mock_1.whoami.return_value = {"name": "freddyaboulton"}

        gr.themes.Monochrome().push_to_hub(repo_name="my_monochrome")
        repo_call_args = mock_1.HfApi().create_commit.call_args_list[0][1]
        assert repo_call_args["repo_id"] == "freddyaboulton/my_monochrome"
        assert any(
            o.path_in_repo == "themes/theme_schema@0.1.3.json"
            for o in repo_call_args["operations"]
        )
        mock_1.whoami.assert_called_with()

    @patch("gradio.themes.base.huggingface_hub")
    def test_first_upload_no_version(self, mock_1):
        mock_1.whoami.return_value = {"name": "freddyaboulton"}

        mock_1.HfApi().space_info.side_effect = huggingface_hub.hf_api.HTTPError("Foo")

        gr.themes.Monochrome().push_to_hub(repo_name="does_not_exist")
        repo_call_args = mock_1.HfApi().create_commit.call_args_list[0][1]
        assert repo_call_args["repo_id"] == "freddyaboulton/does_not_exist"
        assert any(
            o.path_in_repo == "themes/theme_schema@0.0.1.json"
            for o in repo_call_args["operations"]
        )
        mock_1.whoami.assert_called_with()

    @patch("gradio.themes.base.Base._get_next_version", return_value="0.1.3")
    @patch("gradio.themes.base.Base._theme_version_exists", return_value=False)
    @patch("gradio.themes.base.huggingface_hub")
    def test_can_pass_version_and_theme(self, mock_1, mock_2, mock_3):
        mock_1.whoami.return_value = {"name": "freddyaboulton"}

        gr.themes.Monochrome().push_to_hub(
            repo_name="my_monochrome", version="0.1.5", hf_token="foo"
        )
        repo_call_args = mock_1.HfApi().create_commit.call_args_list[0][1]
        assert repo_call_args["repo_id"] == "freddyaboulton/my_monochrome"
        assert any(
            o.path_in_repo == "themes/theme_schema@0.1.5.json"
            for o in repo_call_args["operations"]
        )
        mock_1.whoami.assert_called_with(token="foo")

    @patch("gradio.themes.base.huggingface_hub")
    def test_raise_error_if_no_token_and_not_logged_in(self, mock_1):
        mock_1.whoami.side_effect = OSError("not logged in")

        with pytest.raises(
            ValueError,
            match="In order to push to hub, log in via `huggingface-cli login`",
        ):
            gr.themes.Monochrome().push_to_hub(
                repo_name="my_monochrome", version="0.1.5"
            )

    @patch("gradio.themes.base.Base._get_next_version", return_value="0.1.3")
    @patch("gradio.themes.base.Base._theme_version_exists", return_value=False)
    @patch("gradio.themes.base.huggingface_hub")
    def test_can_upload_to_org(self, mock_1, mock_2, mock_3):
        mock_1.whoami.return_value = {"name": "freddyaboulton"}

        gr.themes.Monochrome().push_to_hub(
            repo_name="my_monochrome", version="0.1.9", org_name="gradio"
        )
        repo_call_args = mock_1.HfApi().create_commit.call_args_list[0][1]
        assert repo_call_args["repo_id"] == "gradio/my_monochrome"
        assert any(
            o.path_in_repo == "themes/theme_schema@0.1.9.json"
            for o in repo_call_args["operations"]
        )
        mock_1.whoami.assert_called_with()

    @patch("gradio.themes.base.Base._get_next_version", return_value="0.1.3")
    @patch("gradio.themes.base.Base._theme_version_exists", return_value=False)
    @patch("gradio.themes.base.huggingface_hub")
    def test_can_make_private(self, mock_1, mock_2, mock_3):
        mock_1.whoami.return_value = {"name": "freddyaboulton"}

        gr.themes.Monochrome().push_to_hub(
            repo_name="my_monochrome", version="0.1.9", org_name="gradio", private=True
        )
        mock_1.create_repo.assert_called_with(
            "gradio/my_monochrome",
            repo_type="space",
            space_sdk="gradio",
            token=None,
            exist_ok=True,
            private=True,
        )


def test_theme_builder_launches():
    gr.themes.builder(prevent_thread_lock=True)
    gr.close_all()
