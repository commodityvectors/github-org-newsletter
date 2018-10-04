const Email = require('email-templates');
const nodemailer = require('nodemailer');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

let smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE !== undefined,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
};

const to = process.env.EMAIL_TO.split(',');

let transporter = nodemailer.createTransport(smtpConfig);

const email = new Email({
    message: {
        from: process.env.EMAIL_FROM
    },
    send: true,
    transport: transporter
});

const client = require('graphql-client')({
    url: 'https://api.github.com/graphql',
    headers: {
        Authorization: 'Bearer ' + process.env.GITHUB_TOKEN
    }
});

const org = process.env.GITHUB_ORG;

client.query(`
query orgData($org: String!) {
  organization(login: $org) {
    name
    url,
    avatarUrl,
    members(first: 0) {
      totalCount
    }
    mostStarred: repositories(first: 3, orderBy: {field: STARGAZERS, direction: DESC}, isFork: false) {
      nodes {
        id
        isFork
        createdAt
        isPrivate
        name
        url
        description
        pushedAt
        stargazers {
          totalCount
        }
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    recentlyPushed: repositories(first: 5, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false) {
      nodes {
        id
        isFork
        pushedAt
        description
        createdAt
        isPrivate
        name
        url
        stargazers {
          totalCount
        }
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    publicRepos: repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC, isFork: false) {
      nodes {
        id
        isFork
        pushedAt
        createdAt
        isPrivate
        name
        url
        description
        stargazers {
          totalCount
        }
        primaryLanguage {
          id
          color
          name
        }
      }
      totalCount
    }
    privateRepos: repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PRIVATE, isFork: false) {
      nodes {
        id
        isFork
        createdAt
        pushedAt
        isPrivate
        name
        url
        description
        stargazers {
          totalCount
        }
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
    const avatarUrl = res.data.organization.avatarUrl;
    const totalMembers = res.data.organization.members.totalCount;

    const publicRepos = res.data.organization.publicRepos.nodes;
    const privateRepos = res.data.organization.privateRepos.nodes;
    const recentlyUpdatedRepos = res.data.organization.recentlyPushed.nodes;
    const mostStarredRepos = res.data.organization.mostStarred.nodes;
    const totalPrivateRepos = res.data.organization.privateRepos.totalCount;
    const totalPublicRepos = res.data.organization.publicRepos.totalCount;

    const template = 'github-newsletter';
    const message = { bcc: to };
    const locals = {
        avatarUrl,
        org,
        totalMembers,
        totalPrivateRepos,
        totalPublicRepos,
        publicRepos,
        privateRepos,
        recentlyUpdatedRepos,
        mostStarredRepos
    };

    return email.send({ template, message, locals, send: false });
}).catch(console.error.bind(console));
