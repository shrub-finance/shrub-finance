const util = require('util');
const Twitter = require('twitter');
const TwitterV2 = require('twitter-v2');
const fs = require('fs');
const path = require('path');

const wait = util.promisify(setTimeout);

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const clientV2 = new TwitterV2({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});




async function scrape_dms() {
  const params = {count: 50};
  let allMessages = [];
  let messages;
  let count = 0;
  const file = path.resolve(__dirname, "output/dms.json");
  let shouldContinue = true;
  if(!fs.existsSync(file)) {
    do {
      try {
        if(15 <= count++) {
          console.log("Waiting 15 minutes for rate limit");
          await wait(15 * 60 * 1000);
          count = 0;
        }
        console.log(params);
        messages = await client.get('direct_messages/events/list.json', params);
        allMessages = allMessages.concat(messages.events);
        console.log("Scraped", allMessages.length);
        if(messages.events.length) {
          params.next_cursor = messages.next_cursor;
        }
        shouldContinue = messages.events.length > 0 && messages.next_cursor;
      } catch(e) {
        if(e[0] && e[0].message && e[0].message.includes("Rate limit")) {
          count = 15;
        } else {
          shouldContinue = false;
        }
        console.error(e);
      }
    } while(shouldContinue);
    fs.writeFileSync(file, JSON.stringify(allMessages));
  } else {
    allMessages = JSON.parse(fs.readFileSync(file).toString());
  }
  return allMessages;
}

async function getCurrentUserId() {
  const user = await client.get('account/verify_credentials', {});
  return user.id;
}


function extractEthereumAddress(message) {
  const pattern = /0x[a-fA-F0-9]{40}/
  return message.message_create.message_data.text.match(pattern);
}

function saveAddresses(messages) {
  const mapping = {};
  const file = path.resolve(__dirname, "output/addresses.json");
  for(const message of messages) {
    mapping[message.message_create.sender_id] = extractEthereumAddress(message)[0]
  }
  fs.writeFileSync(file, JSON.stringify(mapping));
  return mapping;
}

async function getUsersThatLikedTweet(tweet) {
  let allUsers = [];
  const users = await clientV2.get(`tweets/${tweet}/liking_users`, {});
  allUsers = allUsers.concat(users.data);
  const file = path.resolve(__dirname, `output/${tweet}_liked.json`);
  fs.writeFileSync(file, JSON.stringify(allUsers));
  return allUsers;
}

function saveUserAddressThatLikedTweet(tweet, users, mapping) {
  let knownUsers = users.filter(u => mapping[u.id]).reduce((agg, u) => {
    agg[u.id] = mapping[u.id];
    return agg;
  }, {});
  const file = path.resolve(__dirname, `output/${tweet}_liked_addresses.json`);
  fs.writeFileSync(file, JSON.stringify(knownUsers));
  console.log(Object.keys(knownUsers).length, "addresses liked tweet");
}

async function main() {
  console.log("Ingesting messages in the last 30 days");
  const id = await getCurrentUserId();
  const messages = await scrape_dms();

  const toUs = messages.filter(m => m.message_create.target.recipient_id == id.toString());
  const addresses = toUs.filter(m => extractEthereumAddress(m) != null);
  console.log("Received", toUs.length, "messages");
  console.log(JSON.stringify(toUs, null, 2));

  console.log("Received", addresses.length, "addresses");
  console.log(JSON.stringify(addresses, null, 2));
  const mapping = saveAddresses(addresses);

  const tweet = "1453052662837129221";
  const users = await getUsersThatLikedTweet(tweet);
  saveUserAddressThatLikedTweet(tweet, users, mapping);
}

main().catch(e => console.error(e)).then(() => process.exit());
