const DBL = require('@top-gg/sdk');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./data/User');
const config = require('./config.json')
const webhook = new DBL.Webhook(config.dbl_secret);
const fetch = require('node-fetch');
const Discord = require('discord.js');
const port = config.port || 5000
const {
    WebhookClient
} = require('discord.js');
const webhookVote = new WebhookClient(config.webhook_id, config.webhook_url);

app.get('/', (req, res) => {
    res.send('Currently Working.')
})

app.get('/dblwebhook', (req, res) => {
    res.send('Currently Working.')
})

app.post('/dblwebhook', webhook.middleware(), async (req, res) => {

    const votedUser = await fetch(`https://discord.com/api/v8/users/${req.vote.user}`, {
        headers: {
            Authorization: `Bot ${config.bot_token}`
        }
    }).then(res => res.json());


    console.log(`${votedUser.username} Just Voted!`);

    let userV = await User.findOne({
        id: req.vote.user
    });

    if (!userV) {
        await User.create({
            id: req.vote.user,
            votes: 1,
            lastVoted: Date.now()
        });

        userV = await User.findOne({
            id: req.vote.user
        });

    };

    const vote_number = userV.votes + 1 || 1;

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${config.bot_name}'s Voting System'`, `${config.logo || 'https://i.imgur.com/nhyrOYD.png'}`)
        .setColor('GREEN')
        .setTitle(`${votedUser.username} Just Voted`)
        .setDescription(`**${votedUser.username}#${votedUser.discriminator}** (${votedUser.id}) just voted **${config.bot_name}**!`)
        .setFooter(`Vote #${vote_number}`)

    webhookVote.send(embed);

    return await userV.updateOne({
        votes: vote_number,
        lastVoted: Date.now()
    });

});

mongoose.connection.on('connected', () => console.log('Connected to Mongo DB'));

app.listen(port, () => {

    console.log(`Running Vote System on Port ${port}`);

    mongoose.connect(config.mongo, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((err) => {
        console.log(err)
    });

});
