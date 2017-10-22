// @flow
import { Command, flags } from 'cli-engine-heroku';
import Git from '../git';

export default class HelloWorld extends Command {
  static topic = 'what';
  static command = 'amideploying';
  static aliases = ['deploying', 'changed'];
  static description = 'List what files have changed since last deploy.';
  static flags = {
    commitMessages: flags.boolean({ char: 'c', description: 'List commit messages.' }),
    app: flags.app({ required: true, description: 'Name of the Heroku app.' })
  };

  async run() {
    const app = this.flags.app || process.env.HEROKU_APP;
    const listCommitMessages = this.flags.commitMessages || false;

    // TODO: Refactor releases interface into a class.
    const releases = await this.heroku.get(`/apps/${app}/releases`);
    const releaseDescriptions = releases.reverse().map((release) => release.description);

    const deployHashRegex = /Deploy\s([a-z0-9]{8})/;
    // Iterate through release descriptions looking for `Deploy 575bfa87` where the commit hash follows `Deploy`.
    const lastDeployedDescription = releaseDescriptions.find((description) => deployHashRegex.test(description));
    // Pick out the commit hash from the release description.
    const lastDeployedCommit = deployHashRegex.exec(lastDeployedDescription)[1];

    if (!lastDeployedCommit) {
      return this.out.error('Could not find previous release matching regex.', 0);
    }

    let git = new Git(lastDeployedCommit);

    const defaultCommands = [git.listFiles()];
    const commands = listCommitMessages ? defaultCommands.concat(git.listCommitMessages()) : defaultCommands;

    Promise.all(commands)
      .then((responses) => this.out.log(responses.join('\n')));
  }
}
