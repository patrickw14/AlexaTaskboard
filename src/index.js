/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var requestLib = require('request');

/**
 * GLOBAL CONFIG VARIABLES
 */
var baseURL = 'https://hello.service-now.com';

var baseRequest = requestLib.defaults({
    headers: {
        'X-UserToken': '6f3c4b964f751200795eb895f110c71ca095651357695ad9e44d4c079f57fec5ae57b677',
        'Cookie': '_ga=GA1.2.1056955932.1442610102; __utma=179356411.1056955932.1442610102.1443712168.1443719366.11; __utmz=179356411.1443209869.8.3.utmcsr=hello.service-now.com|utmccn=(referral)|utmcmd=referral|utmcct=/$c.do; s_fid=664C52A4358C6C87-311900DDEC6D162C; s_vnum=1456819200426%26vn%3D5; s_lv=1455233558874; AMCV_2A2A138653C66CB60A490D45%40AdobeOrg=793872103%7CMCMID%7C81658558798263094845856023331066053467%7CMCAID%7CNONE%7CMCAAMLH-1455643141.367%7C9%7CMCAAMB-1455643200%7Chmk_Lq6TPIBMW925SPhw3Q%7CMCIDTS%7C16848; BIGipServerpool_hello=2927640842.34110.0000; BAYEUX_BROWSER=ca15-tmwfkwe0d4pgil2u62o713x1; JSESSIONID=F96B80853CCD74CCFA8D42A775C6CD85; glide_user="U0N2MjpGa09teXJVa2JldHliUzdKWENCK3JzczdFQm9hTWdRTg=="; glide_user_session="U0N2MjpGa09teXJVa2JldHliUzdKWENCK3JzczdFQm9hTWdRTg=="; glide_user_route=glide.edaee3a82c27a71f1a7a110cc3169de8; glide_session_store=6B3C4B964F751200795EB895F110C71C',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

var boardID = '702dfa9e4fc112000436b485f110c70f';

var laneMap = {

};


/**
 * AlexaTaskBoardSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AlexaTaskBoardSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AlexaTaskBoardSkill.prototype = Object.create(AlexaSkill.prototype);
AlexaTaskBoardSkill.prototype.constructor = AlexaTaskBoardSkill;

AlexaTaskBoardSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AlexaTaskBoardSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

AlexaTaskBoardSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AlexaTaskBoardSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    response.tellWithoutTermination("Checking...")
    retrieveCards(response);
};

AlexaTaskBoardSkill.prototype.intentHandlers = {
    "GetCards": function(intent, session, response) {
        retrieveCardCount(response);
    },

    "ToDoList": function(intent, session, response) {
        retrieveCardList(response);
    },

    "ToDoCount": function(intent, session, response) {
        retrieveCardCount(response);
    },

    "UpdateCardLane": function(intent, session, response) {
        updateCardLane(response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "To be completed";
        var repromptText = "To be completed";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function retrieveCardCount(response) {
    var url = baseURL + '/api/now/v1/vtb/boards/' + boardID;

    baseRequest(url, function (err, res, body) {
        var result = JSON.parse(body).result;
        var myCards = result.cards.filter(function(card) {
            return card.record.assigned_to.display_value === "Patrick Wilson"
                && card.removed === false
                && card.lane_id === "812dfa9e4fc112000436b485f110c70f";
        });

        var outputSpeech = "You have " + myCards.length + ((myCards.length === 1) ? "task" : "tasks") + " that you need to work on.";

        if (myCards.length === 0) {
            outputSpeech += " Nice job!";
        } else if (myCards.length < 3) {
            outputSpeech += " You're almost done!";
        } else {
            outputSpeech += " Better get to work!";
        }

        response.tellWithCard(outputSpeech, "TaskBoardEcho", outputSpeech);
        return;
    });
}

function retrieveCardList(response) {
    var url = baseURL + '/api/now/v1/vtb/boards/' + boardID;

    baseRequest(url, function (err, res, body) {
        var result = JSON.parse(body).result;
        var myCards = result.cards.filter(function(card) {
            return card.record.assigned_to.display_value === "Patrick Wilson"
                && card.removed === false
                && card.lane_id === "812dfa9e4fc112000436b485f110c70f";
        }).sort(function(cardA, cardB) {
            if (cardA.order < cardB.order) {
                return -1;
            } else if (cardA.order > cardB.order) {
                return 1;
            } else {
                return 0;
            }
        });

        var outputSpeech = "You have " + myCards.length + ((myCards.length === 1) ? "task" : "tasks") + " that are in your to do list.";

        if (myCards.length > 0) {
            outputSpeech += " The top card in that list is this one: " + myCards[0].record.short_description.value;
        }

        response.tellWithCard(outputSpeech, "TaskBoardEcho", outputSpeech);
        return;
    });
}

function updateCardLane(response) {
    var retrieveCardUrl = baseURL + '/api/now/v1/vtb/boards/' + boardID;
    var outputSpeech;

    baseRequest(retrieveCardUrl, function (err, res, body) {
        var result = JSON.parse(body).result;
        var myCards = result.cards.filter(function(card) {
            return card.record.assigned_to.display_value === "Patrick Wilson"
                && card.removed === false
                && card.lane_id === "c12dfa9e4fc112000436b485f110c70f";
        }).sort(function(cardA, cardB) {
            if (cardA.order < cardB.order) {
                return -1;
            } else if (cardA.order > cardB.order) {
                return 1;
            } else {
                return 0;
            }
        });

        if (myCards.length === 0) {
            outputSpeech = "You aren't working on any tasks right now.";

            response.tellWithCard(outputSpeech, "TaskBoardEcho", outputSpeech);
            return;
        }

        var updateCardURL = baseURL + '/api/now/v1/vtb/cards/' + myCards[0].sys_id;

        baseRequest({ url: updateCardURL, method: 'PUT', json: {"lane": "052dfa9e4fc112000436b485f110c70f"}}, function(err2, res2, body2) {
            outputSpeech = "The task you are currently working on has been moved to Done.";
            response.tellWithCard(outputSpeech, "TaskBoardEcho", outputSpeech);
        });
    });
}

AlexaTaskBoardSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AlexaTaskBoardSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the AlexaTaskBoardSkill skill.
    var alexaTaskBoardSkill = new AlexaTaskBoardSkill();
    alexaTaskBoardSkill.execute(event, context);
};

