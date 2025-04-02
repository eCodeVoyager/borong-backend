const crypto = require("crypto");

const transactionIdGen = () => {
  return `TXN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

module.exports = transactionIdGen;
