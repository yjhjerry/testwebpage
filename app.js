
const fetch = require('node-fetch');
const fs = require('fs');

const key = "A.9be9a5cd8b59f342bc083fe6187586ef";
const baseURL = "https://www.webpagetest.org/runtest.php";
const getLocationURL = 'https://www.webpagetest.org/getLocations.php?f=json&k=A'
const siteURL = "www.smilescooter.com";

//Wait for 6 min before querying for data
const getData = (body) => {
    setTimeout(() => {
        fetch(body.data.jsonUrl)
            .then(response => response.json())
            .then(body => {
                let testResult = 'The loadTime for ' + body.data.from + ' is: ' + body.data.average.firstView.loadTime + 'ms';
                console.log(testResult);
                fs.appendFile('testresult.txt', testResult + '\n', err => {
                    if(err) throw err;
                    else console.log('Saved test result to file!');
                });
            })
            .catch(err => console.log('Error retrieving result for ' + body.data.from + '. Please check manually later:' + body.data.jsonUrl))
    }, 360000);
}
// Send test request to webpagetest.org servers
const getResult = (loc) => {
    let finalURL = baseURL + "?url=" + siteURL + "&k=" + key + "&location=" + loc + "&f=json&fvonly=1";
    fetch(finalURL)
        .then(response => response.json())
        .then(body => {
            fs.appendFile('test2.txt', JSON.stringify(body.data) + '\n', err => {
                if (err) throw err;
                else console.log('Saved New Test!');
                getData(body);
            });
        })
        .catch(err => console.log('Error sending test: ' + err))
};

//Get various location sites of webpagetest.org
const testWebPage = () => {
    fetch(getLocationURL)
        .then(response => response.json())
        .then(body => {         
            let locations = body.data;
            for(let loc in locations) {
                if(locations.hasOwnProperty(loc)){
                    let val = locations[loc];
                    let label = val.Label;
                    getResult(loc);
                }
            }
        })
        .catch(err => console.log('Something is wrong: ' + err))
};

testWebPage();

