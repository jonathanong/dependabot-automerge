
const assert = require('assert')

exports.SEARCH = 'user:jonathanong'
exports.LIMIT = 12 // pagination length
exports.GITHUB_TOKEN = process.env.AUTOMERGE_GITHUB_TOKEN || process.env.NPM_TOKEN || process.env.GITHUB_TOKEN
assert(exports.GITHUB_TOKEN, '$GITHUB_TOKEN must be set.')
exports.DRY_MODE = !!process.env.AUTOMERGE_DRY_MODE || !!process.env.DRY_MODE

exports.SEARCH += ' archived:false is:pr -is:locked -is:draft is:open label:dependencies sort:created-desc'
