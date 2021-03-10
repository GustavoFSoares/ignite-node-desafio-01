const app = require('./');

app.listen(3333, function() {
  console.log(`--> Server Running on "${this.address().address}:${this.address().port}" <--`)
});