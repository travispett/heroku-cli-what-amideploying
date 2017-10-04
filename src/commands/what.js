// @flow
import { Command, flags } from 'cli-engine-heroku';
import Git from '../git';

export default class HelloWorld extends Command {
  static topic = 'what';
  static command = 'amideploying';
  static aliases = ['deploying', 'changed'];
  static description = 'List what files have changed since last deploy.';
  static flags = {
    commits: flags.string({ char: 'c', description: 'List commits.' }),
    app: flags.app({ required: true, description: 'Name of the Heroku app.' })
  };

  async run() {
    const appName = this.flags.app || process.env.HEROKU_APP;
    const listCommits = this.flags.commits || false;

    if (listCommits) {
      this.out.log('This feature is not supported yet.');
    }

    const releases = await this.heroku.get(`/apps/${appName}/releases`);
    const releaseDescriptions = releases.reverse().map((release) => release.description);

    const deployHashRegex = /Deploy\s([a-z0-9]{8})/;
    // Iterate through release descriptions looking for `Deploy 575bfa87` where the commit hash follows `Deploy`.
    const lastDeployedDescription = releaseDescriptions.find((description) => deployHashRegex.test(description));
    // Pick out the commit hash from the release description.
    const lastDeployedCommit = deployHashRegex.exec(lastDeployedDescription)[1];

    if (!lastDeployedCommit) {
      return this.out.error('Could not find previous release matching regex.', 0);
    }

    let git = new Git(listCommits);
    git.listFiles(lastDeployedCommit)
      .then((response) => this.out.log(response));
  }
}
