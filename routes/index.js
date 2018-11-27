var express = require('express');
var router = express.Router();
const webpush = require('web-push');

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const email = process.env.EMAIL;

webpush.setVapidDetails('mailto:' + email, publicVapidKey, privateVapidKey);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/publicVapidKey', function (req, res, next) {
  res.json({ key: publicVapidKey })
})

/* endpoint to test push functionality */
router.post('/subscribe', function (req, res, next) {
  const subscription = req.body;
  res.status(201).json({});

  const payload = JSON.stringify({ title: 'test' });
  console.log(subscription);

  webpush.sendNotification(subscription, payload).catch(error => {
    console.error(error.stack);
  });
});

module.exports = router;
