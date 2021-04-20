# Dependabot Automerge

Automatically merge your Dependabot PRs based on custom rules using a GitHub Actions cron job.

## Instructions

1. "Use this template" - don't fork this repository
1. Setup an `NPM_TOKEN` organization-wide GitHub action secret for your organization
    - If you use a different secret name, find and replace the secret in your new repository
1. [Update the config](src/config.js) for the PR search query with your organization such as `org:usds`

## Run continuously

If you'd like to run continuously on a machine and not use GitHub Actions, which has a 5-minimum minimum interval from cron jobs, you can do the following:

1. `npm link` (optional) - to make the `dependabot-automerge` executable global
1. `while true; do dependabot-automerge; sleep 60; done` to continuously run it with a 1 minute interval between runs