#!/usr/bin/env node

const csv = require('csvtojson');
const csvjson = require('csvjson');
const fs = require('fs-extra');
const yargs = require('yargs');

const argv = yargs.alias('f', 'file').alias('o', 'out').argv;

const main = async () => {
  const { file, out } = argv;

  const fileData = await fs.readFile(file, 'utf8');

  const data = await csvjson.toObject(fileData, {
    quote: '"'
  });

  const outputData = data.map(user => {
    const onCallData = {
      'First Name': user['First name'],
      'Last Name': user['Last name'],
      Email: user['Email'],
      'Mobile Phone': user['Mobile phone'],
      'Work Phone': user['Work phone']
    };

    user.Roles.split(',').forEach(role => {
      onCallData[role] = 'X';
    });

    return onCallData;
  });

  const csvData = csvjson.toCSV(outputData, {
    headers: 'key'
  });

  if (out) {
    fs.writeFile(out, csvData, 'utf8');
  } else {
    console.log(csvData);
  }
};

main().catch(err => {
  console.log(err);
  process.exit(1);
});
