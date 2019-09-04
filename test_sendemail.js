//This script test page speed and then send test result through email

const fetch = require('node-fetch');
const fs = require('fs');

const wptAPIKey = '';  //webpagetest.org API key
const baseURL = 'https://www.webpagetest.org/runtest.php';  
const getLocationURL = 'https://www.webpagetest.org/getLocations.php?f=json&k=A'
const timeOut = 180000;  
let siteUrl = '';

const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const resultFile = date+'.'+time;

if (process.argv.length < 3) {
    console.log('Please enter the site url that you want to test the speed with.');
    process.exit();
} else if (process.argv.length > 3) {
    console.log('Please only enter one site url.');
    process.exit();
} else {
    siteURL = process.argv[2];
}

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
        console.log('Location request sent');
        const body = await response.json();
        let locations = Object.keys(body.data);

        let runTestUrls = locations.map(location => {
            let runTestUrl = `${baseURL}?url=${siteURL}&k=${wptAPIKey}&location=${location}&f=json&fvonly=1`;
            return fetch(runTestUrl).then(res => res.json().then(body => body.data.jsonUrl));
        });

        Promise.all(runTestUrls)
            .then(results => {
                console.log('Test requests sent, it might take sometime before you get the result...');
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
                                let testLocation = test.data.from;
                                testLocation = testLocation.replace(/<b>|<\/b>/g, "");
                                let pageLoadTime = test.data.average.firstView.loadTime;
                                let testResult = `The loadTime for ${testLocation} is: ${pageLoadTime} ms`;

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