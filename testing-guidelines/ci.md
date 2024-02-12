# Continous Integration

The CI for Gradio uses GitHub Actions and almost all of the configuration to run the CI exists within the repo. 

The one two cardinal rules that we have for CI are that:

- CI should run on _all_ pull requests, whether those PRs are made from forks or from a branch within the repo.
- These runs must be secure and _never_ leak any secrets, even if the run needs to have access to secrets in order to run successfully.

More information onm how we achieve this can be found in the [architecture section of this document](#architecture).

## High-level overview

Broadly speaking, CI is plit into three main parts. 

- Quality
- Deployments
- Versioning and Publishing

### When do checks run

Checks only run when needed but are required to pass when they run.

We check to see which source files have changed and run the necessary checks. A full breakdown of how we determine this for each kind of check can be found in the [`changes` action](https://github.com/gradio-app/gradio/blob/main/.github/actions/changes/action.yml#L65-L108) but the high-level breakdown is as follows:

- __python checks__ - whenever python source, dependencies or config change.
- __javascript checks__ - whenever javascript source, dependencies or config change.
- __functional and visual checks__ - whenever any sopurce of config changes (most of the time).
- __repo hygiene checks__ - always.

Checks almost always run when the CI config has changed.

If a check can be skipped, the status is set to `success` (green tick) to satisfy the GitHub required checks, but the message will have a text of `Skipped`.


### Quality

We run a series of quality checks on the repo. These range from static checks like linting to unit tests all the way through to fully end-to-end functional tests. 

All tests have a name of something like `test-<type>-<os>-<stability-level>`. `os` and `stability-level` are optional.

This is a simple breakdown of our current quality checks:

| Language   | Check           | operating system | Workflow file            | Notes |
| ---------- | --------------- | ---------------- | ------------------------ | ----- |
| Python     | Linting         | linux            | `test-python.yml`        |       |
| Python     | Formatting      | linux            | `test-python.yml`        |       |
| Python     | Type-checking   | linux            | `test-python.yml`        |       |
| Python     | Unit tests      | linux            | `test-python.yml`        |       |
| Python     | Unit tests      | windows          | `test-python.yml`        |       |
| JavaScript | Linting         | linux            | `test-js.yml`            |       |
| JavaScript | Formatting      | linux            | `test-js.yml`            |       |
| JavaScript | Type-checking   | linux            | `test-js.yml`            |       |
| JavaScript | Unit tests      | linux            | `test-js.yml`            |       |
| n/a        | Functional      | linux            | `test-functional/yml`    |       |
| n/a        | Visual          | linux            | `deploy+test-visual/yml` |       |
| n/a        | Large files     | linux            | `test-hygiene.yml`       | Checks that all files are below 5 MB |
| n/a        | Notebooks match | linux            | `test-hygiene.yml`       | Ensures that notebooks and demos are in sync |


One important thing to note is that we split 'flaky' and 'non-flaky' python unit/ integration test out. These test are flaky because of network requests that they make, they are typically fine but anything that can cause a red check in PRs makes us less trustworthy of our Ci and confidence is the goal! The windows test are also very slow and only test a few edge cases. The flaky and windows tests are not run in every PR but are always run against the release PR to ensure everything is working as expected prior to a release. All other checks are run for every pull request, ensuring everything will work when we merge into `main`.

For more information about the tests and tools that we use and our approach to quality, check the [testing-strategy](https://github.com/gradio-app/gradio/blob/main/testing-guidelines/quality-strategy.md) document. For mroe information on how to run and write tests, see the [contributing guide](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md).


### Deployments

We have three different deployment types that happen when a pull request is created:

- website (`deploy-website.yml`)
- spaces (`deploy-spaces.yml`)
- storybook (`deploy+test-visual.yml`)

#### website

When a PR is created and source code has changed, a preview of the website is created.

When a PR is merged into main the production version of the website is redeployed with the latest changes. 

Documentation is stored by version, `main` represents the current version of the repo which may or may not match the latest release version. The process of generating documentation is roughly like this:

- In Pull Requests, `main` documentation is built from the pull request branch, reflecting the latest changes in that PR (when selecting the `main` option on the docs or guides).
- When we merge a normal Pull Request into `main` the  documentation is built from the repo, reflecting the latest changes on `main` The demo spaces are also redeployed to Hugging Face Spaces at this point (the space variant with the `main_` prefix).
- When a new version of gradio is released (when a versioning PR is merged), the current documentation in the repo is deployed under a version tag. So for version `3.1.1` the current docs and guides in main will be available under that version for eternity. At this point `main` (built from source) and `3.1.1` (built from source and stored in the cloud) are equivalent. We also redeploy demo spaces when a new Gradio version is released, this time without the `main_` prefix).

> [!NOTE]
> Our non-main documentation is all stored in S3.
> Each version `x.x.x` has its own folder containing a JSON file with all docs and guides.
> They live forever.

#### spaces

For every pull request we deploy a Gradio app to Hugging Face Spaces. This allows us to test out new features and check for any obvious issues. This process is follows:

- Build gradio and create a wheel
- Upload the wheel to S3
- Copy certain demos to a folder with somne configuration
- Create a requirements.txt contain links to the uploaded wheels
- Create the necessary spaces configuration (via a README.md file)
- Create a space using the `huggingface_hub` library
- Add a comment linking to the space and explaining how to install that version of `gradio` and `gradio_client`

These spaces are cleaned up after a certain period of time has passed, the wheels are immortal.

#### storybook

We redeploy storybook on every pull request that contains changes to the js source code to allow users to preview visual changes. Each PR is commented with a link to the storybook deployment. This deployment is also responsible for our visual tests as they are part of the same process.

The storybook deploment process is relatively simple as we use an action created by the storybook developers and use their service (chromatic) to handle this:

- Python needs to be installed and gradio needs to be installed locally in order to generate the gradio theme.
- The theme is generated.
- The storybook application is built.
- The storybook application is uploaded to chromatic.

## Architecture

beepboop