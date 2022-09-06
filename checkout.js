const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const date = require('date-and-time');
const path = require('path');
const states = require('./states.json');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


const isLocal = typeof process.pkg === 'undefined'
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

async function checkout(url, i) {

    let profile;
  
    try {
      profile = require(`${basePath}/aycd.json`);
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Profile Not Found`);
    }
  
    
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Launching Browser`);
  
    let browser, page;
  
    try {
      browser = await puppeteer.launch({ headless: false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-web-security','--disable-features=IsolateOrigins,site-per-process'] });
      page = await browser.newPage();
    } catch (err) {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Browser/Page Error\n\n ${err}`);
    }
  
    try {
      await page.goto(url);
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Failed Visiting URL: ${url}`), browser.close();
    }
  
    let cookies;
    try {
      cookies = await page.cookies();
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Error Fetching Cookies`), browser.close();
    }
  
    let modified_cookies = '';
  
    cookies.forEach(cookie => modified_cookies = modified_cookies + `${cookie.name}=${cookie.value}; `)
    
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Adding To Cart`);
  
    let sku = await page.$eval('span[itemprop="sku"]', element=> element.getAttribute("content"));

    if (sku.includes('-')) {
        if (profile && profile[i] && profile[i].size && profile[i].size !== '') {
            sku = sku.split('-')[0] + '-' + profile[i].size;
        }
    }
  
    await fetch("https://www.topperzstore.com/checkout/ajaxAddArticleCart", {
      "headers": {
        "accept": "text/html, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": modified_cookies,
        "Referer": url,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": `sEndlessSubscription=&sActionIdentifier=&sAddAccessories=&sAdd=${sku}&sQuantity=1&__csrf_token=jcf3Z74yD6HWFXHYBS590tnOXasmDk&isXHR=1`,
      "method": "POST"
    }).
    catch (error => {
      if (error) {
        return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Error Adding To Cart\n\n${error}`);
      }
    })
  
    try {
      await page.reload();
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Error Reloading Page`);
    }
  
    try {
      await page.goto('https://www.topperzstore.com/checkout/confirm');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Error Loading Checkout Page`);
    }
  
  
    let first_name = profile[i].shippingAddress.name.split(' ')[0];
    let last_name = profile[i].shippingAddress.name.split(' ')[1];
    let email = profile[i].shippingAddress.email;
    let address = profile[i].shippingAddress.line1;
    let zipcode = profile[i].shippingAddress.postCode;
    let city = profile[i].shippingAddress.city;
    let state = profile[i].shippingAddress.state;
  
    if (!first_name || !last_name || !email || !address || !zipcode || !city) {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Shipping Info Error`);
    }
  
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Entering Profile Details`);
  
    try {
      await page.waitForSelector('#salutation');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Salutation Error`);
    }
  
    try {
      await page.select('#salutation', 'mr');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Salutation Select Error`);
    }
  
    try {
      await page.waitForSelector('#firstname');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] First Name Error`);
    }
  
    try {
      await page.type('#firstname', first_name, { delay: 50 });
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] First Name Type Error`);
    }
  
    try {
      await page.waitForSelector('#lastname');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Last Name Error`);
    }
  
    try {
      await page.type('#lastname', last_name, { delay: 50 });
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Last Name Type Error`);
    }
  
    try {
      await page.waitForSelector('#register_personal_skipLogin');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Login Error`);
    }
  
    try {
      await page.click('#register_personal_skipLogin');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Login Click Error`);
    }
  
    try {
      await page.waitForSelector('#register_personal_email');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Email Error`);
    }
  
    try {
      await page.type('#register_personal_email', email);
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Email Type Error`);
    }
  
    try {
      await page.waitForSelector('#street');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Street Error`);
    }
  
    try {
      await page.type('#street', address, { delay: 50 });
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Street Type Error`);
    }
  
    try {
      await page.waitForSelector('#zipcode');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Zip Code Error`);
    }
  
    try {
      await page.type('#zipcode', zipcode, { delay: 50 });
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Zip Code Type Error`);
    }
  
    try {
      await page.waitForSelector('#city');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] City Error`);
    }
  
    try {
      await page.type('#city', city), { delay: 50 };
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] City Type Error`);
    }
  
    try {
      await page.waitForSelector('select[name="register[billing][country_state_28]"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Country Error`);
    }
  
    try {
      await page.select('select[name="register[billing][country_state_28]"]', states[state]);
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Country Select Error`);
    }
  
    try {
      await page.waitForSelector('button[class="register--submit btn is--primary is--large is--icon-right"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Submit Error`);
    }
  
    try {
      await page.click('button[class="register--submit btn is--primary is--large is--icon-right"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Submit Click Error`);
    }
  
    await sleep(1000);
  
    try {
      await page.waitForSelector('#payment_mean18');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Payment 18 Error`);
    }
  
    try {
      await page.click('#payment_mean18');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Payment 18 Click Error`);
    }
  
    await sleep(5000);
  
    let name = profile[i]?.billingAddress?.name;
    let card_number = profile[i]?.paymentDetails?.cardNumber?.split('')[0] + profile[0]?.paymentDetails?.cardNumber;
    let card_cvc = profile[i]?.paymentDetails?.cardCvv?.split('')[0] + profile[0]?.paymentDetails?.cardCvv;
    let card_exp_month = profile[i]?.paymentDetails?.cardExpMonth;
    let card_exp_year = profile[i]?.paymentDetails?.cardExpYear?.split('');
    card_exp_year = card_exp_year[2] + card_exp_year[3];
  
    if (!name || !card_number || !card_cvc || !card_exp_month || !card_exp_year) {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Billing Info Error`);
    }
  
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Entering Card Info`);
  
    try {
      await page.waitForSelector('input[class="stripe-card-holder panel--td"]', { visible: true });
    } catch {
      console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Card Panel Error... Retrying`);
      await page.reload();
  
      try {
        await page.waitForSelector('input[class="stripe-card-holder panel--td"]', { visible: true });
      } catch {
        return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Card Panel Error 2`);
      }
  
    }
  
    const input = await page.$('input[class="stripe-card-holder panel--td"]');
    if (!input) {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Error Loading Input`);
    }
  
    try {
      await input.click({ delay: 100, clickCount: 3 })
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Click Error`);
    }
  
    try {
      await page.type('input[class="stripe-card-holder panel--td"]', name, {delay: 50});
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Name Type Error`);
    }
  
    try {
      await page.keyboard.press("Tab");
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Key Error 1`);
    }
  
    try {
      await page.keyboard.type(card_number, { delay: 50 })
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Card Number Error`);
    }
  
    try {
      await page.keyboard.press("Tab");
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Key Error 2`);
    }
  
    try {
      await page.keyboard.type(card_exp_month, {delay: 100})
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Exp Month Error`);
    }
  
    try {
      await page.keyboard.type(card_exp_year, {delay: 100})
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Exp Year Error`);
    }
  
    try {
      await page.keyboard.press("Tab");
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Key Error 3`);
    }
  
    try {
      await page.keyboard.type(card_cvc, {delay: 100})
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] CVC Error`);
    }
  
    try {
      await page.waitForSelector('button[type="submit"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Button Submit Error`);
    }
  
    try {
      await page.click('button[type="submit"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Button Submit Click Error`);
    }
  
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Submitting Order`);
  
    try {
      await page.waitForSelector('button[class="btn is--primary is--large right is--icon-right"]', { visible: true })
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Submit Order Error`);
    }
  
    try {
      await page.focus('button[class="btn is--primary is--large right is--icon-right"]');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Focus Error`);
    }
  
    try {
      await page.keyboard.type('\n');
    } catch {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Key Error 4`);
    }
  
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Sleeping 15 seconds`);
    await sleep(15000);
  
    
    if (page && page.url() === 'https://www.topperzstore.com/checkout/shippingPayment') {
      return console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Failed Submitting Order`), await browser.close();
    } else {
      console.log(`[${date.format(new Date(), 'hh:mm:ss')}] [Task #${+i + +1}] Potentional Order Submission`);
    }
}

module.exports = { checkout }