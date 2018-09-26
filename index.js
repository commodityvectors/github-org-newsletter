const client = require('graphql-client')({
    url: 'https://api.github.com/graphql',
    headers: {
        Authorization: 'Bearer ' + process.env.GITHUB_TOKEN
    }
});

const org = "commodityvectors";

client.query(`
query orgData($org: String!) {
  organization(login: $org) {
    name
    url,
    avatarUrl,
    members(first: 0) {
      totalCount
    }
    mostStarred: repositories(first: 5, orderBy: {field: STARGAZERS, direction: DESC}) {
      nodes {
        id
        createdAt
        isPrivate
        name
        url
      }
      totalCount
    }
    recentlyPushed: repositories(first: 5, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        id
        createdAt
        isPrivate
        name
        url
      }
      totalCount
    }
    publicRepos: repositories(first: 20, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
      nodes {
        id
        createdAt
        isPrivate
        name
        url
      }
      totalCount
    }
    privateRepos: repositories(first: 20, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PRIVATE) {
      nodes {
        id
        createdAt
        isPrivate
        name
        url
      }
      totalCount
    }
  }
}
`, { org }).then(console.log.bind(console));