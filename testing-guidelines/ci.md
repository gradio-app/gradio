# Continous Integration

The CI for Gradio uses GitHub Actions and almost all of the configuration to run the CI exists within the repo. 

The two cardinal rules that we have for CI are that:

- CI should run on _all_ pull requests, whether those PRs are made from forks or from a branch within the repo.
- These runs must be secure and _never_ leak any secrets, even if the run needs to have access to secrets in order to run successfully.

More information on how we achieve this can be found in the [architecture section of this document](#architecture).

## High-level overview

Broadly speaking, CI is split into three main parts. 

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


One important thing to note is that we split 'flaky' and 'non-flaky' Python unit/integration tests out. These tests are flaky because of network requests that they make. They are typically fine, but anything that can cause a red check in PRs makes us less trustworthy of our CI and confidence is the goal! The Windows tests are also very slow and only test a few edge cases. The flaky and windows tests are not run in every PR, but are always run against the release PR to ensure everything is working as expected prior to a release. All other checks are run for every pull request, ensuring everything will work when we merge into `main`.

For more information about the tests and tools that we use and our approach to quality, check the [testing-strategy](https://github.com/gradio-app/gradio/blob/main/testing-guidelines/quality-strategy.md) document. For more information on how to run and write tests, see the [contributing guide](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md).


### Deployments

We have three different deployment types that happen when a pull request is created:

- website (`deploy-website.yml`)
- spaces (`deploy-spaces.yml`)
- storybook (`deploy+test-visual.yml`)

#### website

When a PR is created and source code has changed, a preview of the website is created.

When a PR is merged into `main` the production version of the website is redeployed with the latest changes. 

Documentation is stored by version, `main` represents the current version of the repo which may or may not match the latest release version. The process of generating documentation is roughly like this:

- In Pull Requests, `main` documentation is built from the pull request branch, reflecting the latest changes in that PR (when selecting the `main` option on the docs or guides).
- When we merge a normal pull request into `main` the documentation is built from the repo, reflecting the latest changes on `main`. The demo spaces are also redeployed to Hugging Face Spaces at this point (the space variant with the `main_` prefix).
- When a new version of Gradio is released (when a versioning PR is merged), the current documentation in the repo is deployed under a version tag. So for version `3.1.1` the current docs and guides in main will be available under that version for eternity. At this point `main` (built from source) and `3.1.1` (built from source and stored in the cloud) are equivalent. We also redeploy demo spaces when a new Gradio version is released, this time without the `main_` prefix.

> [!NOTE]
> Our non-main documentation is all stored in S3.
> Each version `x.x.x` has its own folder containing a JSON file with all docs and guides.
> They are immortal.

#### spaces

For every pull request we deploy a Gradio app to Hugging Face Spaces. This allows us to test out new features and check for any obvious issues. This process is follows:

- Build Gradio and create a wheel
- Upload the wheel to S3
- Copy certain demos to a folder with some configuration
- Create a requirements.txt contain links to the uploaded wheels
- Create the necessary spaces configuration (via a README.md file)
- Create a space using the `huggingface_hub` library
- Add a comment linking to the space and explaining how to install that version of `gradio` and `gradio_client`

These spaces are cleaned up after a certain period of time has passed, the wheels are immortal.

#### storybook

We redeploy storybook on every pull request that contains changes to the frontend source code to allow users to preview visual changes. Each PR is commented with a link to the storybook deployment. This deployment is also responsible for our visual tests as they are part of the same process.

The storybook deploment process is relatively simple as we use an action created by the storybook developers and use their service (chromatic) to handle this:

- Python needs to be installed and gradio needs to be installed locally in order to generate the gradio theme.
- The theme is generated.
- The storybook application is built.
- The storybook application is uploaded to chromatic.

### Versioning and publishing


## Architecture

The CI on this repo is a little unconventional, this is mainly to work around various gaps in the GitHub Actions API while solving for our use case.

### Technical explainer

#### The problem

We have the following constraints and challenges:

- We have a relatively comprehensive CI suite, different components have their own idiosyncracies.
- Many of our jobs need access to secrets but security is a high priority.
- We are an open source project and want the same experience for contributors (PRs from forks) as the core team have (PRs from repo branches).
- We want to make all of the important checks required.
- We want CI to be fast, certain jobs should be skipped where appropriate. These jobs may still be 'required' to pass if—and only if—they run.
- CI should give confidence over time, we don't want to be overlooking the odd ❌ as a 'normal' part of our CI, even for optional jobs. This will erode trust.
- Many of our CI jobs share the same steps. We want to avoid excessive duplication where possible for maintenance reasons.

Some of these are discrete problems with their own discrete solutions but a lot of the challenges stem from when certain GitHub Action events occur and how priveleged/ secure those event 'types' are.

#### Demystifying event triggers

Workflows are a discreet set of jobs with a discrete set of steps. It might be reasonable to assume that a workflow is a workflow. Sadly this isn't true, the event that triggers the workflow dictates not only when that workflow will run (which makes sense) but also a bunch of other information about both its environment and even which version of that workflow file will run (this is a git repo after all). This latter feature, _also_ makes sense, but it isn't immediately apparent.

- `pull_request` - This event runs correctly on contributor PRs and check out the correct branch by default (more on this later) but it doesn't not have access to secrets.
- `pull_request_target` - Same as `pull_request` but it _does_ have access to secrets. However because this event runs in to context of the branch (and repo) the PR is made from, that PR has also has direct access to secrets making it insecure.
- `push` - When triggered from a fork, this will essentially be a `push` to the fork not the target repo. In many cases the workflow won't run ata ll (depends on the settings of the fork) and it won't have access to secrets from the base repo. Even if it did, it would be inscure.

There are ways to run workflows indirectly:

- `workflow_dispatch` - This event always runs in the context of main  You can programatically trigger this workflow event, allowing more control over where that workflow runs but you need to use the GitHub API to do this. Ttherefore the triggering workflow needs access to secrets, rendering it insecure for our purposes.
- `workflow_run` - This is essentially `workflow_dispatch` inverted. Instead of triggering it from elsewhere explicitly, the workflow _itself_ determines which workflow will trigger _it_. This means that you do not need access to secrets in order to start a `workflow_run` and since this event type runs in the context of main, it is secure.

<details>
  <summary>What does the "context" of an event mean?</summary>

In GitHub Actions 'context' is a somewhat overloaded term, but it typically describes the permissions, available data, and the source code state that a given workflow has access to, without any additional code. 

For example, you can check out any branch of any public repo in any workflow but the context is important before any configured steps are run, in fact, the context is important before the workflow even starts. For practical purposes, there are two elements to the 'context' that people care about.

- Which workflow file on which branch actually runs.
- What information about the repo or triggering event does that workflow have access to.

If a workflow "runs in the context of the default branch" then it will use the workflow that exists on trhe default branch, regardless of whether or not the event that originall triggered it was on another branch. If the workflow "runs in the context of the pull request branch" then it will pull the workflow file from the pull request branch.

The information available inside a workflow after it has started (usually available via the [`github` context](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context)). For pull requests, this will include things like the pull request number, and the ref and HEAD SHA of the pull request branch. For workflows running in the context of the default branch, this may not contain much information, but all references to the branch and sha will mainly just be references to main.

This diagram is an attempt at illustrating this process.

<details>

#### New solution, new problems

For the reasons described above, we chose to use `workflow_run` _heavily_ for the gradio repo. However `workflow_run` presents its own challenges:

- This event runs in the context of main, it doesn't offer any of the conveniences that `push` and `pull_request` events give you, it knows very very little about the workflow run even that triggered it. It _does not_ inherit the teriggering workflow's context. This is a huge problem.
- This workflow kind of runs in the void. It is run in the context of the default branch and so maintains references to that branch, however, it isn't really 'attached' to a commit or ref in any meaningful way and the status of the run (the 'check') is not added to any commits anywhere.

Both of these problems were eventually solve by using the GitHub API in combination with the information we get from the workflow event's context. Getting the commit reference of the pull request that triggered the workflow is the main challenge, when we have that, creating statuses on commits is trivial. 

##### What branch am i even in?

The 'context' a workflow runs in is the branch that actions/checkout will checkout by default. In this case that is `main`. We don't want `main`.

Figuring out what branch or pull request triggered a workflow run is surprisingly difficult depending on the event that you allow to trigger it. The data you have access to in a ` workflow_run` event is pretty limited. It is okay for pull requests, you get the PR number, but for pushes and other events it can be challenging. We trigger `workflow_runs` from the following events:

- `pull_request` - this is fine, we get the PR number.
- `push` - not fine, but we get the commit SHA which will do.
- `issue_comment` - couldn't be less fine, we only get the title.

*The reason we use the `issue_comment` event is because pull request are actually a special type of issue when it comes to the title, body, and replies.*

It is much easier to find a SHA from a PR number than the other way around but both are possible, getting a PR from an issue title, or PR title is pretty error-prone. We typically need the following information in our workflows:

- Pull request number, if one exists (we create comments in a the PR for certain jobs).
- Source repository
- Source branch
- The HEAD SHA of the source branch (sometimes we want to check this out, we always want checks to appear on this ref)
- The SHA of the magical 'merge' branch that github creates (we want to check this out usually)
- Any labels for the PR (we use these for certain conditional jobs)

<detail>
<summary>A magical branch, you say?</summary>

GitHub actually creates two magical refs. `pull/<pr-number>/head` and `pull/<pr-number>/merge`. Both of these refs are read-only, you cannot push to them no matter how many `-f`s you add.

The `head` variant is pretty much the same as the HEAD of the pr branch, except it exists in the target repo regardless of whether it was created from a fork or not. This is quite nice as the commit SHA for this ref will be the same as the commit SHA for the HEAD of the source branch. This makes checking out the branch easier.

The `merge` variant is special. This is a branch that merges the PR changes into the target branch. `pull_request` events have this branch set as their 'default' and it is what gets checked out by default in `pull_request` workflows. The beauty of this branch is that any tests you run against it are essentially being run on the merged result of this PR and `main`. This isn't commonly know but it is exactly what you want in a pull request.

</detail>

The path to getting this information isn't necessarily complex but it is different for every event type (worse if also want to manually determine it for `pull_request` and `push` events too). To solve this problem we wrote a [custom JavaScript action](https://docs.github.com/en/actions/creating-actions/about-custom-actions) to solve it (yes, GitHub actions has naming issues "Actions" is the product "an action" is a discrete component).

Our custom actions are [detailed below]().

##### Optional, required checks

This sounds contradictory but what we want is check that don't _always_ need to run but when they run they _must_ pass. GitHub doesn't really have a concept of this.

The solution is to set the check as required in the repo settings and then do the following:

- If the job runs then the commit status is set to pending prior to the run.
- If the job fails then the commit status should be set to failed.
- If the job successed then then commit status should be set to success.
- If the job does not need to run then it should be set to success with some text explaining it was skipped.

Determining what has changed is straightforward, we use a third-party action for this. But we clear need to run but also maybe not run our workflows.

To solve this particular problem we _always_ trigger our workflows but don't always run all of them.

- Every workflow we might want to run is triggered by the pull request. We have a simple workflow that does nothing, it simply acts as a 'hook' for the `workflow_run` workflows to listen to.
- Those workflows have their own information about whether the job should run or not.
- If the job thinks that it _should_ run then it creates a 'pending' status and sets its output to `should_run = true`
- If the job thinkgs that it _shouldn't_ run then it creates a 'success' status nand sets its output to `should_run = false`. 
- The next job in the workflow _depends_ on that initial run. It will only run on the condition that the `changes` job has an output of `should_run == true`. 
- If it does run then the workflow does its thing and then updates the commit status to `success` or `failure` depending on the outcome. 

We use a composite action to colocate the change detection logic and reuse that across workflows. We use a custom JavaScript action to create the commit statuses, again for easier reuse.

### Technical details

From a technical point of view our workflows can be split into two categories:

- Quality, deployment and versioning for pull requests
- Final versioning and release when merged into main

#### pull requests

Every PR run triggers a 'trigger' workflow that does nothing itself but acts as a trigger for other workflows to run via the `workflow_run` event.

With the exceoption of the `hygiene` check everything is conditional and will only run if specific files have changes. These run all have one job that everything else depends on that reuses the composite `changes` action, this action determines whether or not a check to should run at based on the files that change. This action uses the 


