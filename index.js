#!/usr/bin/env node
'use strict'

let fs = require('fs')
let commands = {
    help: require('./src/cli/help'),
    setup: require('./src/cli/setup'),
    start: require('./src/cli/start'),
    stop: require('./src/cli/stop')
}

// make sure this is being run from the mission-control package
let packageFile = JSON.parse(fs.readFileSync('package.json').toString())

if (packageFile.name !== 'mission-control') {
    console.error('This script must be ran from a mission-control project')
    process.exit(1)
}

// Get args after node example.js
let args = process.argv.slice(2)

// If there was no command specified, display the help
if (args.length === 0) {
    commands.help()
    process.exit(0)
}

switch (args[0]) {

    case 'setup':
        commands.setup()
        break

    case 'start':
        commands.start(args)
        break

    case 'stop':
        commands.stop()
        break

    case 'help':
        commands.help()
        break

    default:
        console.log('Invalid command')
        commands.help()

}
