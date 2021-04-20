# Dependabot Automerge

Automatically merge your Dependabot PRs based on custom rules using a GitHub Actions cron job.

# Instructions

1. "Use this template" - don't fork this repository
1. Setup an `NPM_TOKEN` organization-wide GitHub action secret for your organization
    - If you use a different secret name, find and replace the secret in your new repository
1. [Update the config](src/config.js) for the PR search query with your organization such as `org:usds`