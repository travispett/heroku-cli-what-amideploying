// @flow

const cp = require('child_process');
const fs = require('fs');

export default class Git {
  constructor(lastDeployedCommit) {
    this.lastDeployedCommit = lastDeployedCommit;
  }

  listFiles() {
    return new Promise((resolve, reject) => {
      const gitArgs = ['diff', '--name-only', 'HEAD', this.lastDeployedCommit];

      cp.execFile('git', gitArgs, (err, stdout) => {
        if (err) {
          reject(err);
        }

        Promise.all([this.checkMigrations(stdout), this.checkAfterParty(stdout)])
          .then((responses) => stdout.concat(...responses))
          .then((response) => resolve(response));
      });
    });
  }

  listCommitMessages() {
    return new Promise((resolve, reject) => {
      const gitArgs = ['--no-pager', 'log', '--pretty=format:"%s"', `${this.lastDeployedCommit}..HEAD`];

      cp.execFile('git', gitArgs, (err, stdout) => err ? reject(err) : resolve(listCommitMessagesWithHeader(stdout)));
    });
  }

  checkMigrations(filesChanged) {
    return new Promise((resolve, reject) => {
      fs.access('db/migrate', (err) => resolve(this.migrationsPresent(err, filesChanged)));
    });
  }

  checkAfterParty(filesChanged) {
    return new Promise((resolve, reject) => {
      fs.access('lib/tasks/deployment', (err) => resolve(this.afterPartyPresent(err, filesChanged)));
    });
  }

  migrationsPresent(err, filesChanged) {
    return /(structure|schema)\.(sql|rb)/.test(filesChanged) && !err ? '\n*** New migrations ***' : '';
  }

  afterPartyPresent(err, filesChanged) {
    return /tasks\/deployment\//.test(filesChanged) && !err ? '\n*** New after_party tasks ***' : '';
  }
}

function listCommitMessagesWithHeader(commitMessages) {
  const commitMessagesHeader = '*** Commits:\n';
  const splitMessages = commitMessages.split('"');
  splitMessages.unshift(commitMessagesHeader);
  return splitMessages.join('');
}
