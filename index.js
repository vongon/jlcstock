var scrapeIt = require("scrape-it");

var main = (cb) => {
  return cb();
}

main((err, res) => {
  if (err) {
    throw err;
  }
  console.log("Done!");
})

