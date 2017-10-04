// @flow

const cp = require('child_process');
const fs = require('fs');

export default class Git {
  constructor(commits) {
    this.commits = commits;
  }

  listFiles(lastDeployedCommit) {
    return new Promise((resolve, reject) => {
      const gitArgs = ['diff', '--name-only', 'HEAD', lastDeployedCommit];

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

  listCommits() {}

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
