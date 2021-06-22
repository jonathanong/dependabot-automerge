
const chalk = require('chalk')

const {
  SEARCH,
  LIMIT,
  DRY_MODE
} = require('./config')
const {
  request,
  getPullRequestsQuery,
  addCommentQuery,
  approvePRQuery
} = require('./github')
const {
  isMajorVersionChange,
  MERGE
//   REBASE
} = require('./dependabot')

async function main () {
  let hasNextPage = true
  let cursor = null

  while (hasNextPage) {
    const result = await request(getPullRequestsQuery(SEARCH, LIMIT, cursor))
    ;({ hasNextPage } = result.data.search.pageInfo)

    for (const edge of result.data.search.edges) {
      const merged = await handlePR(edge.node)
      if (merged) {
        // add a timeout so we don't spam Dependabot with requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        cursor = edge.cursor
      }
    }
  }
}

async function handlePR (pr) {
  console.log(chalk.bold(`"${pr.title}": ${pr.url}`))

  if (pr.files.nodes.length > 1) {
    console.log(chalk.red(' - More than 1 file change detected, skipping.'))
    return
  }

  const file = pr.files.nodes[0].path
  if (!file.endsWith('package-lock.json') && !file.endsWith('npm-shrinkwrap.json')) {
    console.log(chalk.red(' - Changed file is not a lockfile, skipping.'))
    return
  }

  if (!isMajorVersionChange(pr)) {
    console.log(chalk.red(' - Major version change or invalid version change detected, skipping.'))
    return
  }

  if (pr.comments.nodes.some(x => x.body === MERGE)) {
    console.log(chalk.yellow(' - @dependabot merge command already commented, skipping.'))
    return
  }

  const state = pr?.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state
  if (state && state !== 'SUCCESS') {
    console.log(chalk.yellow(` - Status checks are not passing, got ${state}, skipping.`))
    return
  }

  if (pr.mergeable === 'CONFLICTING') {
    console.log(chalk.yellow(' - PR has merge conflicts, skipping. Please rebase.'))
    return
  }

  if (pr.mergeable !== 'MERGEABLE') {
    console.log(chalk.yellow(' - PR is not mergeable, skipping.'))
    return
  }

  if (!DRY_MODE) {
    console.log(chalk.green(' - Commanding @dependabot to squash & merge.'))

    let query = 'mutation {\n'
    // no approvals
    if (!pr.reviews.nodes.length) query += approvePRQuery(pr)
    query += addCommentQuery(pr, MERGE) + '}'

    await request(query)
    return true
  }
}

main().catch((err) => {
  console.error(err.stack)
})
