
const https = require('https')

const { GITHUB_TOKEN } = require('./config')

Object.assign(exports, {
  request,
  getPullRequestsQuery,
  addCommentQuery,
  approvePRQuery
})

function getPullRequestsQuery (search, limit, cursor) {
  let input = `query:${JSON.stringify(search)}, type:ISSUE, first:${limit}`
  if (cursor) input += `, after:${JSON.stringify(cursor)}`
  return `
query SearchPullRequests {
    search(${input}) {
        pageInfo {
            hasNextPage
        },
        edges {
            cursor,
            node {
                ... on PullRequest {
                    id,
                    title,
                    repository {
                        id,
                        name
                    },
                    url,
                    mergeable,
                    autoMergeRequest {
                        mergeMethod
                    },
                    files(first:2) {
                        nodes {
                            path
                        }
                    },
                    commits(last:1) {
                        nodes {
                            commit {
                                statusCheckRollup {
                                    state
                                }
                            }
                        }
                    },
                    comments(first:5) {
                        nodes {
                            id,
                            body
                        }
                    },
                    reviews(first:1, states:APPROVED) {
                        nodes {
                            state
                        }
                    }
                }
            }
        } 
    }
}`
}

function addCommentQuery (pr, text) {
  return `
    addComment(input:{subjectId:${JSON.stringify(pr.id)}, body:${JSON.stringify(text)}}) {
        subject {
            id
        }
    }`
}

function approvePRQuery (pr, text) {
  return `
    addPullRequestReview(input:{pullRequestId:${JSON.stringify(pr.id)}, event:APPROVE}) {
        pullRequestReview {
            id
        }
    }
`
}

async function request (query) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'jonathanong/automerge'
      }
    })

    request.on('response', (response) => {
      let str = ''

      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        str += chunk
      })
      response.on('error', reject)
      response.on('end', () => {
        try {
          const result = JSON.parse(str)

          if (Array.isArray(result.errors)) {
            const err = new Error(result.errors[0].message)
            err.errors = result.errors
            reject(err)
            return
          }

          resolve(result)
        } catch (err) {
          err.str = str
          reject(err)
        }
      })
    })

    request.on('error', reject)
    request.write(`{"query":${JSON.stringify(query)}}`)
    request.end()
  })
}
