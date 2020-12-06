const puppeteer = require('puppeteer');
const async = require('async');

const parts = [
  { partNumber: 'C7171', description: 'example capacitor' },
  { partNumber: 'C69901', description: 'TPA6132A2RTER, headphone amp' },
]

var main = (cb) => {
  results = [];
  async.eachSeries(parts, (part, cb) => {
    console.log('Querying part', part.partNumber);
    queryStock(part.partNumber, (err, result) => {
      if (err) {
        return cb(err);
      }
      part.quantity = result.quantity;
      results.push(part);
      return cb();
    })
  }, (err) => {
    if (err) {
      return cb(err);
    }
    allInStock = true
    for (item of results) {
      if(item.quantity === '0') {
        allInStock = false;
      }
    }

    if(allInStock) {
      console.log('Everything is in stock!');
    } else {
      console.log('At least one part out of stock : (');
    }
    console.log(results);
    return cb();
  });
}

var queryStock = (partNumber, cb) => {
  (async () => {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(`https://jlcpcb.com/parts/componentSearch?searchTxt=${partNumber}`,{waitUntil: 'networkidle2'})

    const result = await page.evaluate(() => {
      let quantity = document.querySelector('td.ng-binding').innerText;
      return {
        quantity
      }
    })
    browser.close()
    result.partNumber = partNumber;
    return cb(null, result)
  })()
}


main((err, result) => {
  if (err) {
    throw err;
  }
  console.log("Done!");
})

