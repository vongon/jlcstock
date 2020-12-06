const puppeteer = require('puppeteer');

var main = (cb) => {
  query('C7171', (err, { quantity }) => {
    if (err) {
      return cb(err);
    }
    console.log({quantity})
  });
}

var query = (partNumber, cb) => {
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
    return cb(null, result)
  })()
}


main((err, result) => {
  if (err) {
    throw err;
  }
  console.log("Done!", {result});
})

