# real-estate-scraper

Web scraper that makes it easier to find real estate in Slovenia. After scraper finishes you get an
email with updates, so you don't have to check web pages all the time but only. In the email, you get all
the information you need: Title with location, short description, price and link to the original
listing.

Email example:

![Email example](http://shrani.si/f/17/AI/2kgeUav7/mail.jpg)

We are supporting two webpages Bolha.com and Nepremicnine.net

## Install
In order to run a script, you have to install [Node.js] (https://nodejs.org/en/) and do the following:

```bash
git clone https://github.com/tresko/real-estate-scraper.git
npm install -g yarn
yarn install
mv .env.example .env
```

## Run
Firstly you need to fill the env file with your data:
```bash
SMTP_HOST=in-v3.mailjet.com - SMTP host
SMTP_PORT=587 - SMTP port
SMTP_USER - SMTP username
SMTP_PASSWORD - SMTP password
MAIL_FROM="Joe Doe" <mail@example.com> - Email from which emails will be sent
MAIL_TO=mail@example.com - List of email addresses on which to send email 
BOLHA_URLS=url1,url2  - list of bolha.com URLs 				
NEPREMICNINE_URLS=url1,url2 - list of nepremicnine.net URLs			
```
You can get the desired URL's from the chosen site(bolha, nepremicnine.net) by configuring search parameters on the site and then copying the URL into the configuration file. 

Type the following command to run the script and press Enter:
```bash
node index.js
```
