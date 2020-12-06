const puppeteer = require('puppeteer');
const async = require('async');
const sgMail = require('@sendgrid/mail');

const parts = [
  { partNumber: 'C389591', description: 'ADAU1761BCPZ-R7, codec' },
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

    let data = {}

    if(allInStock) {
      data = {
        subject: 'JLCSTOCK: Everything is in stock!',
        body: results
      }
    } else {
      data = {
        subject: 'JLCSTOCK: At least one part out of stock : (',
        body: results
      }
    }
    console.log(data)
    sendEmail(data, cb);
  });
}

var sendEmail = (data, cb) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: 'ryan@vongon.com',
    from: 'ryan@vongon.com',
    subject: data.subject,
    text: JSON.stringify(data.body, null, 2)
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('email sent success');
      return cb();
    })
    .catch((err) => {
      return cb(err);
    })
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

