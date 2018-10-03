const Email = require('email-templates');

const email = new Email({
    message: {
        from: 'noreply@commodityvectors.com'
    },
    send: true,
    transport: {
        jsonTransport: true
    }
});

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
    mostStarred: repositories(first: 3, orderBy: {field: STARGAZERS, direction: DESC}) {
      nodes {
        id
        isFork
        createdAt
        isPrivate
        name
        url
        description
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    recentlyPushed: repositories(first: 5, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        id
        isFork
        description
        createdAt
        isPrivate
        name
        url
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    publicRepos: repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
      nodes {
        id
        isFork
        createdAt
        isPrivate
        name
        url
        description
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    privateRepos: repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PRIVATE) {
      nodes {
        id
        isFork
        createdAt
        isPrivate
        name
        url
        description
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
  }
}
`, { org }).then(res => {
    const totalMembers = res.data.organization.members.totalCount;

    const publicRepos = res.data.organization.publicRepos.nodes;
    const privateRepos = res.data.organization.privateRepos.nodes;
    const recentlyUpdatedRepos = res.data.organization.recentlyPushed.nodes;
    const mostStarredRepos = res.data.organization.mostStarred.nodes;
    const totalPrivateRepos = res.data.organization.privateRepos.totalCount;
    const totalPublicRepos = res.data.organization.publicRepos.totalCount;

    const template = 'github-newsletter';
    const message = { to: 'rafael@commodityvectors.com' };
    const locals = {
        org, totalMembers, totalPrivateRepos, totalPublicRepos, publicRepos, privateRepos, recentlyUpdatedRepos, mostStarredRepos
    };

    return email.send({ template, message, locals });
});