var express = require('express'),
  path = require('path'),
  routes = require('./routes/index')

var app = express();

app.set('port', (process.env.PORT || 3000));

app.set('view engine', 'pug');

app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/vendor', express.static(path.join(__dirname, 'vendor')));
app.use('/', routes);

app.use(function(req, res, next) {
  res.status(404).send('Sorry can\'t find that!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(app.get('port'), function() {
  console.log('MN Election Night is running on port', app.get('port'));
});