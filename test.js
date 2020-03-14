let json = require('./ships.json');

c = 0;
json.forEach(v => {
    v.ships.forEach(s => {
        c++;
        s.id = c;
    })
});

console.log(JSON.stringify(json));