const fetch = require('node-fetch');
const fs = require('fs');


var key = "A.9be9a5cd8b59f342bc083fe6187586ef";
var baseURL = "https://www.webpagetest.org/runtest.php";
var siteURL = "www.smilescooter.com";
// var locations = ["ec2-us-east-1", "ec2-us-west-1", "ec2-sa-east-1", "ec2-eu-west-1", "London_EC2", "ec2-eu-west-3", "ec2-eu-central-1", "ap-south-1", "ec2-ap-southeast-1", "ec2-ap-northeast-2", "ec2-ap-northeast-1", "ec2-ap-southeast-2"];
var getStatusURL = "http://www.webpagetest.org/testStatus.php";
var locations = ["ec2-sa-east-1", "ec2-eu-west-1"];

locations.forEach(location => {
    let finalURL = baseURL + "?url=" + siteURL + "&k=" + key + "&location=" + location + "&f=json&fvonly=1";
    fetch(finalURL)
        .then(response => response.json())
        .then(body => {
            fs.appendFile('test1.txt', JSON.stringify(body.data) + '\n', (err) => {
                if (err) throw err;
                console.log('Saved New Test!');
            });
            setTimeout(() => {
                fetch(body.data.jsonUrl)
                    .then(response => response.json())
                    .then(body => {
                        console.log('The loadTime for ' + location + ' is: ' + body.data.average.firstView.loadTime)
                    })
                    .catch(err => console.log('Error retrieving result: ' + err))
            }, 360000);
        })
        .catch(err => console.log('Error sending test: ' + err))
});
