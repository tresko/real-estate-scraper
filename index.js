require('dotenv').config()
const puppeteer = require('puppeteer')
const fs = require('fs')
const $ = require('cheerio')
const Handlebars = require('handlebars')
const nodemailer = require('nodemailer')
const format = require('date-fns/format')

const TEMPLATE_URL = './template.html'

async function loadWebsite(url, successCallback = () => {}, errorCallback = err => {}) {
  const data = await puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => page.goto(url.trim()).then(() => page.content()))
    .then(successCallback)
    .catch(errorCallback)
  return data
}

// Nepremicnine.net
async function nepremicnineScrapper(urls) {
  const getDataFromNepremicnine = html => {
    return $('.seznam', html)
      .children()
      .map(function() {
        return {
          url: $('meta[itemprop=mainEntityOfPage]', this).attr('content'),
          title: $('.title', this).text(),
          description: $('[itemprop=description]', this).text(),
          price: $('.cena', this).text(),
          size: $('.velikost', this).text(),
        }
      })
      .get()
  }

  return Promise.all(
    urls.map(async url => await loadWebsite(url, getDataFromNepremicnine, err => [])),
  ).then(result => result.reduce((prevArray, current) => prevArray.concat(current), []))
}

// bolha.com
async function bolhaScrapper(urls) {
  const getDataFromBolha = html => {
    console.log(html)
    return $('.ad', html)
      .map(function() {
        return {
          url: `http://www.bolha.com${$('a', this).attr('href')}`,
          title: $('a', this).attr('title'),
          price: $('.price', this).text(),
        }
      })
      .get()
  }

  return Promise.all(
    urls.map(async url => await loadWebsite(url, getDataFromBolha, err => [])),
  ).then(result => result.reduce((prevArray, current) => prevArray.concat(current), []))
}

async function main() {
  const nepremicnineData = await nepremicnineScrapper(
    process.env.NEPREMICNINE_URLS && process.env.NEPREMICNINE_URLS.split(',')
      ? process.env.NEPREMICNINE_URLS.split(',')
      : [],
  )
  const bolhaData = await bolhaScrapper(
    process.env.BOLHA_URLS && process.env.BOLHA_URLS.split(',')
      ? process.env.BOLHA_URLS.split(',')
      : [],
  )

  console.log(nepremicnineData, bolhaData)

  const content = fs.readFileSync(TEMPLATE_URL, 'utf8')
  const template = Handlebars.compile(content)

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: (process.env.SMTP_PORT && parseInt(process.env.SMTP_PORT, 10)) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM, // sender address
    to: process.env.MAIL_TO, // list of receivers
    subject: 'Nepremicnine', // Subject line
    text: '', // plain text body
    html: template({
      nepremicnine: nepremicnineData,
      bolha: bolhaData,
      date: format(new Date(), 'DD.MM.YYYY, HH:mm'),
    }), // html body
  })

  // process.exit()
}

main()
