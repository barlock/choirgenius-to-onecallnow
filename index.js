#!/usr/bin/env node

const csv = require('csvtojson');
const csvjson = require('csvjson');
const fs = require('fs-extra');
const yargs = require('yargs');
const _ = require('lodash');

const argv = yargs
  .alias('f', 'file')
  .alias('o', 'out')
  .argv;

const main = async () => {
  const { file, out, subgroups = '', only = '' } = argv;

  const roleFilter = only.split(',');
  const subgroupFilter = subgroups.split(',');

  const fileData = await fs.readFile(file, 'utf8');

  const csvData = await csvjson.toObject(fileData, {
    quote: '"'
  });

  const userData = csvData.map(user => ({
    ...user,
    Roles: user.Roles.split(',')
  }));

  const outputData = userData
    .filter(user => _.intersection(user.Roles, roleFilter).length > 0)
    .map(user => {
      const onCallData = {
        'External ID': user['User ID'],
        'First Name': user['First name'],
        'Last Name': user['Last name'],
        Email: user['Email'],
        'Phone': user['Mobile phone'] || user['Home phone'] || user['Work phone']
      };

      user.Roles
        .filter(role => subgroupFilter.includes(role))
        .forEach(role => {
          onCallData[role] = 'X';
        });

      return onCallData;
    });

  const oneCallCSV = csvjson.toCSV(outputData, {
    headers: 'key'
  });

  if (out) {
    fs.writeFile(out, oneCallCSV, 'utf8');
  } else {
    console.log(oneCallCSV);
  }
};

main().catch(err => {
  console.log(err);
  process.exit(1);
});
