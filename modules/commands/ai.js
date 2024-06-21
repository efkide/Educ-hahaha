const axios = require('axios');

module.exports.config = {
    name: "ai",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "AI",
    usages: "[question]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const { messageID, threadID } = event;
    const id = event.senderID;

    const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/gptconvo?ask=${content}&id=${id}`;

    if (!content) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", threadID, messageID);

    const l = await api.sendMessage("🔎 Searching for an answer Please Wait.....", threadID, messageID);

    try {
        if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments[0]) {
            const attachment = event.messageReply.attachments[0];

            if (attachment.type === "photo") {
                const imageURL = attachment.url;
                const response = await axios.get(`https://haze-gemini-v-8ba147453283.herokuapp.com/gemini-vision?text=${encodeURIComponent(content)}&image_url=${encodeURIComponent(imageURL)}`);
                const caption = response.data.response;
                if (caption) {
                    return api.editMessage(`𝗚𝗲𝗺𝗶𝗻𝗶 𝗩𝗶𝘀𝗶𝗼𝗻 𝗣𝗿𝗼 𝗜𝗺𝗮𝗴𝗲 𝗥𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻 \n━━━━━━━━━━━━━━━━━━\n${caption}`, l.messageID);
                } else {
                    return api.sendMessage("🤖 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚛𝚎𝚌𝚘𝚐𝚗𝚒𝚣𝚎𝚍 𝚝𝚑𝚎 𝚒𝚖𝚊𝚐𝚎𝚜.", threadID, messageID);
                }
            }
        }

        const response = await axios.get(apiUrl);
        const { response: result } = response.data;
        const responseMessage = `𝗖𝗛𝗔𝗧𝗚𝗣𝗧\n━━━━━━━━━━━━━━━━━━\n${result}`;

        api.sendMessage(responseMessage, threadID, l.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};
