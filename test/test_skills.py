from pathlib import Path

import pytest

from gradio.cli.commands import skills


@pytest.mark.parametrize("global_", [False, True])
def test_skills_add_defaults_to_central_location(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, global_: bool
):
    central_global = tmp_path / "global"
    central_local = tmp_path / "local"
    monkeypatch.setattr(
        skills,
        "_get_skill_targets",
        lambda: (central_global, central_local, {}, {}),
    )
    monkeypatch.setattr(skills, "_download", lambda _url: "# Skill\n")

    skills.skills_add(global_=global_)

    central_path = central_global if global_ else central_local
    assert (central_path / skills.SKILL_ID / "SKILL.md").is_file()
    assert (central_path / skills.HF_SKILL_ID / "SKILL.md").is_file()


def test_create_symlink_copies_skill_when_windows_privilege_is_missing(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    central_skill_path = tmp_path / ".agents" / "skills" / "gradio"
    central_skill_path.mkdir(parents=True)
    (central_skill_path / "SKILL.md").write_text("# Gradio\n", encoding="utf-8")

    class WindowsSymlinkPrivilegeError(OSError):
        winerror = 1314

    def deny_symlink(*_args, **_kwargs):
        raise WindowsSymlinkPrivilegeError(
            1314, "A required privilege is not held by the client"
        )

    monkeypatch.setattr(Path, "symlink_to", deny_symlink)

    installed_path = skills._create_symlink(
        tmp_path / ".codex" / "skills", central_skill_path, False
    )

    assert installed_path is not None
    assert installed_path.is_dir()
    assert not installed_path.is_symlink()
    assert (installed_path / "SKILL.md").read_text(encoding="utf-8") == "# Gradio\n"


def test_create_symlink_reraises_other_errors(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    central_skill_path = tmp_path / ".agents" / "skills" / "gradio"
    central_skill_path.mkdir(parents=True)

    def deny_symlink(*_args, **_kwargs):
        raise OSError("unexpected failure")

    monkeypatch.setattr(Path, "symlink_to", deny_symlink)

    with pytest.raises(OSError, match="unexpected failure"):
        skills._create_symlink(
            tmp_path / ".codex" / "skills", central_skill_path, False
        )
