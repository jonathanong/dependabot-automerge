
const semver = require('semver')

Object.assign(exports, {
  MERGE: '@dependabot squash and merge',
  REBASE: '@dependabot rebase',
  isMajorVersionChange
})

function isMajorVersionChange (pr) {
  const match = /from\s+(\S+)\s+to\s+(\S+)/ig.exec(pr.title)
  if (!match) return false
  const from = match[1]
  const to = match[2]
  if (!semver.valid(from)) return false
  if (!semver.valid(to)) return false
  if (semver.major(to) === 0) return semver.minor(from) === semver.minor(to)
  if (semver.major(from) === semver.major(to)) return true
  return false
}
