#!/usr/bin/env node

const fs = require('fs');
const ethers = require('ethers');

// Generate a random key
const privateKey = ethers.Wallet.createRandom().privateKey;
const bearerToken = ethers.Wallet.createRandom().privateKey;


// Read the sample.env file
fs.readFile('./sample.env', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Replace the PRIVATE_KEY with the new key
  let result = data.replace(/PRIVATE_KEY=.*/, `PRIVATE_KEY=${privateKey}`);
  result = result.replace(/BEARER_TOKEN=.*/, `BEARER_TOKEN=${bearerToken}`);

  // Write the result to .env file
  fs.writeFile('.env', result, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('.env file has been updated with a new PRIVATE_KEY');
  });
});