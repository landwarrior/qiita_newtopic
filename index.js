'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

var APP_ID = undefined;
var HELP_MESSAGE = "助けは来ない";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "さようなら";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('getIntent');
    },
    'getIntent': function () {
        var self = this;
        var url = 'https://qiita.com/api/v2/items?page=1&per_page=3';
        var start = '新着の、3件のタイトルを読み上げます。';
        var message = '';
        https.get(url, function(res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function(res) {
                var data_list = JSON.parse(body);
                for (var i = 0; i < data_list.length; i++) {
                    var num = i + 1;
                    message += num + 'つ目。' + data_list[i]['title'] + '。';
                }
                self.emit(':tell', start + message);
                return;
            });
        }).on('error', function(e) {
            self.emit(':tell', '通信に問題が発生しました');
        });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'SessionEndedRequest': function () {
        // Nothing to do
    }
};
