//This script test page speed and then send test result through email

const fetch = require('node-fetch');
const fs = require('fs');

const wptAPIKey = '';  //webpagetest.org API key
const baseURL = 'https://www.webpagetest.org/runtest.php';  
const getLocationURL = 'https://www.webpagetest.org/getLocations.php?f=json&k=A'
const siteURL = 'https://www.smilescooter.com';
const timeOut = 360000;  

let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let resultFile = date+'.'+time;

const sendEmail = () => {
    const mailgunAPIKey = '';
    const sendingDomain = 'tg.smilescooter.com';
    const mailgun = require('mailgun-js')({apiKey: mailgunAPIKey, domain: sendingDomain});

    fs.readFile(resultFile, 'utf-8', (err, filedata) => {
        if (err) throw err;
        let content = filedata;

        let data = {
          from: 'TestWebPage <jerry@tg.smilescooter.com>',
          to: 'yjhjerry621@gmail.com',
          subject: 'WebPageTest at ' + resultFile,
          text: content
        };
        mailgun.messages().send(data, (err, body) => {
            console.log(body);
        }); 
    });
}

const testWebPage = async () => {
    try {
        const response = await fetch(getLocationURL);
        const body = await response.json();
        let locations = Object.keys(body.data);
        // locations.splice(0,18);

        let runTestUrls = locations.map(location => {
            let runTestUrl = baseURL + "?url=" + siteURL + "&k=" + wptAPIKey + "&location=" + location + "&f=json&fvonly=1";
            return fetch(runTestUrl).then(res => res.json().then(body => body.data.jsonUrl));
        });

        Promise.all(runTestUrls)
            .then(results => {
                let resultArr = results.map(result => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(fetch(result).then(res => res.json()))
                        }, timeOut);
                    })
                });

                Promise.all(resultArr)
                    .then(res => {
                        res.forEach(test => {
                            if (test.statusCode == 200) {
                                let testResult = 'The loadTime for ' + test.data.from + ' is: ' + test.data.average.firstView.loadTime + 'ms';
                                fs.appendFile(resultFile, testResult + '\n', err => {
                                    if (err) throw err;
                                });
                                console.log(testResult);
                            }
                            else if (test.statusCode == 100) {
                                console.log('Hasn\'t processed yet');
                            }
                            else {
                                console.log('Something else is wrong!');
                            }
                        });
                        sendEmail();
                    })
            })
    } catch (err) {
        console.log(err);
    }
}

testWebPage();


