import app from './app';

app.listen(5000, () => {
  // GET / --> sanity endpoint
  app.get('/', (req, res) => {
    res.send('Works!');
    res.end();
  });

  console.log('Listening on port 5000!');
});
