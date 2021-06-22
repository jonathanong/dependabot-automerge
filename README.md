# Dependabot Automerge

Automatically merge your Dependabot PRs based on custom rules using a GitHub Actions cron job in its own repository.

Unlike other methods of automatic merging dependabot PRs which generally rely on another CI workflow, 
this template creates a single cron job for your entire organization. The benefits of this are:

- A centralized codebase for Dependabot merging rules for your entire organization; you don't have to maintain rules in every repository
- Decoupling Dependabot merging rules from the affected codebase; this avoids issues like CI/CD that may trigger on a Dependency merging rule change
- Efficient use of GitHub Actions minutes - there is no polling and you could spend less than a minute in GitHub Actions minutes every 5 minutes in a large organization

Use the best strategy for your organization.

## Instructions

1. "Use this template" - don't fork this repository
1. Setup an `NPM_TOKEN` organization-wide GitHub action secret for your organization
    - If you use a different secret name, find and replace the secret in your new repository
1. [Update the config](src/config.js) for the PR search query with your organization such as `org:usds`

## Customization

This template is designed for customization. 
Customize the modules in [src/](src) to satisfy the requirements of your organization.

## Run continuously

If you'd like to run continuously on a machine and not use GitHub Actions, which has a 5-minimum minimum interval from cron jobs, you can do the following:

1. `npm link` (optional) - to make the `dependabot-automerge` executable global
1. `while true; do dependabot-automerge; sleep 60; done` to continuously run it with a 1 minute interval between runs
