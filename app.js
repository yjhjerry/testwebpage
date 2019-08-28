
const fetch = require('node-fetch');
const fs = require('fs');

const wptKey = "";
const baseURL = "https://www.webpagetest.org/runtest.php";
const getLocationURL = 'https://www.webpagetest.org/getLocations.php?f=json&k=A'
const siteURL = "https://www.smilescooter.com";
const timeOut = 360000;

let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let resultFile = date+'.'+time;

// Wait for 6 min before querying for data
const getTestResult = (body) => {
    setTimeout(() => {
        fetch(body.data.jsonUrl)
            .then(response => response.json())
            .then(body => {
                let testResult = 'The loadTime for ' + body.data.from + ' is: ' + body.data.average.firstView.loadTime + 'ms';
                fs.appendFile(resultFile, testResult + '\n', err => {
                    if(err) throw err;
                });
            })
            .catch(err => console.log('Error retrieving result for ' + body.data.from + '. Please check manually later:' + body.data.jsonUrl))
    }, timeOut);
}

// Send test request to webpagetest.org servers
const sendTestRequest = (loc) => {
    let finalURL = baseURL + "?url=" + siteURL + "&k=" + wptKey + "&location=" + loc + "&f=json&fvonly=1";
    fetch(finalURL)
        .then(response => response.json())
        .then(body => {
            fs.appendFile('test-meta.txt', JSON.stringify(body.data) + '\n', err => {
                if (err) { 
                    throw err;
                }
                else {
                    console.log('Test request sent to ' + loc + ', please wait for ' + timeOut/1000 + 's to see the result');
                    getTestResult(body);
                }
            });
        })
        .catch(err => console.log('Error sending test: ' + err))
};

// Send email
const sendEmail = () => {

    const API_KEY = '';
    const DOMAIN = 'tg.smilescooter.com';
    const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
    var content;

    fs.readFile(resultFile, 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        content = data;
    });

    const data = {
      from: 'TestWebPage <jerry@tg.smilescooter.com>',
      to: 'yjhjerry621@gmail.com',
      subject: 'WebPageTest at ' + resultFile,
      text: content
    };

    mailgun.messages().send(data, (err, body) => {
        if(error) throw err;
        else console.log(body);
    });
}

// Get various location sites of webpagetest.org
const testWebPage = () => {
    fetch(getLocationURL)
        .then(response => response.json())
        .then(body => {         
            const locations = body.data;
            for(let loc in locations) {
                if(locations.hasOwnProperty(loc)){
                    sendTestRequest(loc);
                }
            }
        })
        .catch(err => console.log('Something is wrong: ' + err))
};

testWebPage();
