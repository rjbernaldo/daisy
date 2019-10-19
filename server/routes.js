const keystone = require('keystone');
const fetch = require('node-fetch');

const router = keystone.createRouter();
const Inquiry = keystone.list('Inquiry');

const results = [{
  description: `In Australia, you don’t have to tip. But you can if you want to!\n`,
  tags: ['tip'],
  image: 'tip-etiquette',
}, {
  description: `That’s $72.94 in USD. Don’t spend it all in one go!`,
  tags: ['how much'],
  image: 'how-much',
}, {
  description: `I found one lounge near you.`,
  attachments: [{
    title: 'REX LOUNGE',
    description: 'Terminal 2, 5.57mi',
    image: 'rex',
  }],
  tags: ['lounge'],
  image: 'lounge',
}];

router.get('/api', async (req, res) => {
  const { query } = req.query;

  const apiKey = 'l7xx959b3e71839d457d8157e23f66d16e9e';
  const apiSecret = 'be062e3f9e20413ba108fbf756cef83c';
  const auth = 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64');

  const r = results.find(r => {
    const tags = r.tags;
    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      if (query) {
        const v = query.toLowerCase();
        if (v.indexOf(currentTag) > -1) return true;
      }
    };
  });

  const result = Object.assign({}, r);

  if (result) {
    try {
      const countryIsoNum = 505;

      if (result.image === 'tip-etiquette') {
        const authRes = await fetch('https://api.discover.com/auth/oauth/v2/token', {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth,
          },
          body: 'grant_type=client_credentials&scope=DCI_TIP',
        });
        const authResJson = await authRes.json();
        const accessToken = authResJson.access_token;
        const dataRes = await fetch(
          `https://apis.discover.com/dci/tip/v1/guide?countryisonum=${countryIsoNum}&languagecd=en`, {
          headers: {
            'Accept': 'application/json',
            'X-DFS-API-PLAN': 'DCI_TIPETIQUETTE_SANDBOX',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const json = await dataRes.json();
        json.forEach((d) => {
          result.description = result.description + ` \n${d.tipCategoryDesc}: $${d.defaultTipAmount} AUD`;
        });
      } else if (result.image === 'how-much') {
        const authRes = await fetch('https://api.discover.com/auth/oauth/v2/token', {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth,
          },
          body: 'grant_type=client_credentials&scope=DCI_CURRENCYCONVERSION',
        });
        const authResJson = await authRes.json();
        const accessToken = authResJson.access_token;
        const dataRes = await fetch(
          `https://apis.discover.com/dci/currencyconversion/v1/exchangerate?currencycd=AUD`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-DFS-API-PLAN': 'DCI_CURRENCYCONVERSION_SANDBOX',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const json = await dataRes.json();
        const multiplier = json.exchange_rate;
        const amount = (parseFloat(query.toLowerCase().replace('?', '').replace('how much is $', '')) * multiplier).toFixed(2);
        result.description = result.description.replace('$72.94', `$${amount}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (!result) {
    Inquiry.model.create({ query });
  }

  res.json({
    success: true,
    result,
  })
});

module.exports = router;