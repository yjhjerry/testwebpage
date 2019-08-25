
const fetch = require('node-fetch');
const fs = require('fs');

const key = "A.9be9a5cd8b59f342bc083fe6187586ef";
const baseURL = "https://www.webpagetest.org/runtest.php";
const getLocationURL = 'https://www.webpagetest.org/getLocations.php?f=json&k=A'
const siteURL = "www.smilescooter.com";

const getResult = (loc, label) => {
    let finalURL = baseURL + "?url=" + siteURL + "&k=" + key + "&location=" + loc + "&f=json&fvonly=1";
    fetch(finalURL)
        .then(response => response.json())
        .then(body => {
            fs.appendFile('test2.txt', JSON.stringify(body.data) + '\n', (err) => {
                if (err) throw err;
                console.log('Saved New Test!');
            });
            setTimeout(() => {
                fetch(body.data.jsonUrl)
                    .then(response => response.json())
                    .then(body => {
                        console.log('The loadTime for ' + label + ' is: ' + body.data.average.firstView.loadTime)
                    })
                    .catch(err => console.log('Error retrieving result for ' + label + ':' + err))
            }, 360000);
        })
        .catch(err => console.log('Error sending test: ' + err))
};

const testWebPage = () => {
    fetch(getLocationURL)
        .then(response => response.json())
        .then(body => {         
            let locations = body.data;
            for(let loc in locations) {
                if(locations.hasOwnProperty(loc)){
                    let val = locations[loc];
                    let label = val.Label;
                    getResult(loc, label);
                }
            }
        })
        .catch(err => console.log('Something is wrong: ' + err))
};

testWebPage();

