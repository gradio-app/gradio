# Description

Please include: 
* relevant motivation
* a summary of the change 
* which issue is fixed. 
* any additional dependencies that are required for this change.

Closes: # (issue)

# Checklist:

- [ ] I have performed a self-review of my own code
- [ ] I have added a short summary of my change to the CHANGELOG.md
- [ ] My code follows the style guidelines of this project
- [ ] I have commented my code in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes


# A note about changesets 

Hello 👋 and thank you for contributing to Gradio!

All pull requests must add a changeset file in the changeset directory, unless the pull request is labeled with the "no-changelog-update" label.

Please add a file to the changesets directory called `pr_{pr number}.md`. It's important that the PR number in the title matches the number of this PR.

The format of a changeset file is as follows:
```
---
type: one of bugfix, new-feature, breaking, or doc
bump: one of patch, minor, or major
---
Description of the change
```

The `type` field corresponds to the type of change, while the `bump` field corresponds to the version bump associated with this change.
A `major` bump is used when the PR introduces backwards incompatible API changes. The `minor` bump is used when you add a new feature
in a backwards compatible manner. A `patch` bump is used when you make backwards compatible bug fixes.

If you would like an image/gif/video showcasing your feature, it may be best to edit the changeset file using the 
GitHub web UI since that lets you upload files directly via drag-and-drop.