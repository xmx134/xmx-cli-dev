#! /usr/bin/env node

const inquirer = require('inquirer')

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'your name',
      default: 'x'
    }
  ])
  .then(answer => {
    console.log(answer)
  })
