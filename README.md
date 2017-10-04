# heroku-cli-what-amideploying

Team doesn't create changelogs? Hard to keep track of what you're deploying? Using a buildpack that doesn't run migrations or any post-deploy tasks?

This is a [Heroku CLI](https://github.com/heroku/cli) plugin for listing what files are being deployed and whether any migrations or post-deploy tasks should be run.

### Dependencies
- git

This was built and tested with this release of the Heroku CLI:
```
$ heroku -v
heroku-cli/6.14.31-33a2d0a (darwin-x64) node-v8.5.0
```

### Install
```
heroku plugins:install heroku-cli-what-amideploying
```

### Run

##### Flags

- `-a` - (REQUIRED) This is your Heroku app name passed the same as you would pass to other Heroku CLI commands.
- `-c` - This is not yet implemented.

##### Commands
```
heroku what:amideploying -a your-heroku-app-name

<List of files will be here>
```

The command is also aliased so you can run either of the following:
```
heroku deploying -a your-heroku-app-name
heroku changed -a your-heroku-app-name
```

The command does a diff of the `HEAD` of the current branch and the commit hash of the last [release](https://devcenter.heroku.com/articles/releases) of the given app.

It then outputs the changed files (the same as `git diff --name-only hash1 hash2`) and then checks to see if files have changed in either of the below detected folders.

If files have changed, it outputs a message with which type of task (migrations or after_party).

If migrations and post-deploy tasks are present the output of the command will look like this:
```
heroku what:amideploying -a your-heroku-app-name

<List of files will be here>

*** New migrations ***
*** New after_party tasks ***
```

### Supported Detection

##### Migrations
`**/*/db/migrate` - This should cover Rails apps.

##### Post-deploy
`**/*/tasks/deployment` - This covers [after_party.](https://github.com/theSteveMitchell/after_party)

### Developing

Check [Heroku's CLI Plugins guide](https://devcenter.heroku.com/articles/developing-cli-plugins) for more info.
