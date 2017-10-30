// @flow

import fs from 'fs-extra';
import path from 'path';

export const topic = {
  name: 'what',
  description: 'Lists files changed and commits since last Heroku deploy.'
};

let dir = path.join(__dirname, 'commands');
export const commands = fs.readdirSync(dir)
  .filter(f => path.extname(f) === '.js')
  // $FlowFixMe
  .map(f => require('./commands/' + f).default);
