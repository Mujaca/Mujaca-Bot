require('dotenv').config()
var colors = require('colors');
module.exports = {
  log: (msg) => {
    console.log(`[${process.env.NAME}]`.magenta,msg);
  }
}