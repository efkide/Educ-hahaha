const cron = require('node-cron');
const logger = require('./utils/log');
const axios = require("axios");
const fs = require('fs-extra');
const PREFIX = true;

const randomMessages = [
  "Hello Everyone",
  "Hello Everyone Kamusta School Niyo?",
  "Hello There I'm still alive",
  "Hello Everyone Be Respectful to others Thanks you",
  "How are you today?",
  "Greetings all to Members",
  "Hello Educator AI User Remember Don't Spam the Bot"
];

function randomMessage(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function sendGreeting(api, messages) {
  api.getThreadList(20, null, ['INBOX']).then((list) => {
    list.forEach((thread) => {
      if (thread.isGroup) {
        api.sendMessage(randomMessage(messages), thread.threadID).catch((error) => {
          logger(`Error sending message: ${error}`, 'AutoGreet');
        });
      }
    });
  }).catch((error) => {
    logger(`Error getting thread list: ${error}`, 'AutoGreet');
  });
}

module.exports = async ({ api }) => {
  const minInterval = 5;
  let lastMessageTime = 0;
  let messagedThreads = new Set();

  const config = {
    autoRestart: {
      status: true,
      time: 40,
      note: 'To avoid problems, enable periodic bot restarts',
    },
    acceptPending: {
      status: false,
      time: 30,
      note: 'Approve waiting messages after a certain time',
    },
    greetings: [
      {
        cronTime: '0 5 * * *', // At 05:00 AM
        messages: [`Good morning! Have a great day ahead!`],
      },
      {
        cronTime: '0 8 * * *', // At 08:00 AM
        messages: [`Life update:\nMiss ko na sya`],
      },
      {
        cronTime: '0 3 * * *', // At 03:00 AM
        messages: [`Life update:\nNangungulila sa kanya`],
      },
      {
        cronTime: '0 11 * * *', // At 11:00 AM
        messages: [`Good afternoon! Take a break and stay hydrated!`],
      },
      {
        cronTime: '0 22 * * *', // At 10:00 PM
        messages: [`Good night! Ensure a restful sleep for a productive day tomorrow.`],
      },
    ]
  };

  config.greetings.forEach((greeting) => {
    cron.schedule(greeting.cronTime, () => {
      sendGreeting(api, greeting.messages);
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });
  });


  cron.schedule('*/50 * * * *', () => {
    sendGreeting(api, randomMessages);
  }, {
    scheduled: true,
    timezone: "Asia/Manila"
  });

  if (config.autoRestart.status) {
    cron.schedule(`*/${config.autoRestart.time} * * * *`, () => {
      logger('Start rebooting the system!', 'Auto Restart');
      process.exit(1);
    });
  }

  // Accept pending messages logic
  if (config.acceptPending.status) {
    cron.schedule(`*/${config.acceptPending.time} * * * *`, async () => {
      const list = [
        ...(await api.getThreadList(1, null, ['PENDING'])),
        ...(await api.getThreadList(1, null, ['OTHER'])),
      ];
      if (list[0]) {
        api.sendMessage('Hello mga Pogi Musta kayo?', list[0].threadID);
      }
    });
  }
};