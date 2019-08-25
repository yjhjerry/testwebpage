
const fetch = require('node-fetch');

const fs = require('fs');
const lineReader = require('readline');

rl = lineReader.createInterface({
    input: fs.createReadStream('test-cdn.txt')
});
  
rl.on('line', function (line) {
    nl = JSON.parse(line);
    console.log(nl.jsonUrl);
    fetch(nl.jsonUrl)
        .then(response => response.json())
        .then(body => {
            let testResult = 'The loadTime for ' + body.data.from + ' is: ' + body.data.average.firstView.loadTime + 'ms';
            console.log(testResult);
            fs.appendFile('testresult-cdn.txt', testResult + '\n', err => {
                if(err) throw err;
                // else console.log('Saved test result to file!');
            });
        })
        .catch(err => console.log('Something is wrong:', err))
});
