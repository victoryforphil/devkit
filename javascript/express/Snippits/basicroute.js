app.get('/status', function (req, res) {
  Logger.Info("Server", "Route: /status ", "Sending Health Status.");
  res.send('Online.')
})