#!/usr/bin/env node

const ethers = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log(wallet.privateKey);
