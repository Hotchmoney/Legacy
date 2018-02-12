const alexaSDK = require('alexa-sdk');
//const awsSDK = require('aws-sdk');
const graphlib = require('graphlib');

const appId = 'amzn1.ask.skill.fde0c2b6-41e9-480f-b342-ca7295488590';
const table = 'SwordTable';

// TODO replace dummy text with introduction
const instructions = 'Welcome to Legacy. What do you do?';

/* This object contains a list of intent handlers, the functions that
   make up our core application logic. Each handler builds a response by
   modifying the response object, using "listen" (to continue the session)
   and "tell" (to end it). It ends by with "responseReady", which sends the response.

   For more, see https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs.
 */
const handlers = {

    //This intent handler sets up the game state if it's the first session.
    'LaunchRequest' () {
        if (Object.keys(this.attributes).length === 0){ //if there's no player data
            this.attributes['Map'] = graphlib.json.write(makeMap());
            this.attributes['Head'] = 'room 1'; //Head is the current room
        }
        this.response.listen(instructions);
        this.emit(':responseReady');
    },

    //This intent handler outputs a description of the current room.
    'DescribeRoomIntent' () {
        const mapString = this.attributes['Map'];
        const map = graphlib.json.read(mapString); //unserialize map object
        const head = this.attributes['Head'];
        if (map) {
            const roomName = map.node(head); //gets room description
            this.response.listen(`You are in ${roomName}.`);
        } else {
            this.response.listen('Something went wrong.');
        }
        this.emit(':responseReady');
    },

    //This handler outputs a list of exits from the current room.
    'DescribeExitsIntent' () {
        const mapString = this.attributes['Map'];
        const map = graphlib.json.read(mapString);
        const head = this.attributes['Head'];

        //Because graphlib doesn't offer a function that returns all
        //edge labels from a room, we have to iterate through an array
        //of edges and create a new array with edge labels.
        const exitList = map.nodeEdges(head);
        const exitNames = [];
        for (let i =0; i < exitList.length; i++){
            //console.log(exitList[i]);
            exitNames.push(map.edge(exitList[i]));
        }
        this.response.listen('Here are the exits from this room: '
                            + sayArray(exitNames));
        this.emit(':responseReady');
    },

    //This handler allows the player to move between rooms.
    //It requires either the name of a path to take or the name
    //of an adjacent room to move to. These are provided as slots.
    'MoveIntent' () {
        const mapString = this.attributes['Map'];
        const map = graphlib.json.read(mapString);
        const head = this.attributes['Head'];

        const pathName = isSlotValid(this.event.request, "Path");
        const destName = isSlotValid(this.event.request, "Room");
        //console.log(pathName, destName);
        if (pathName){ //if we were given a path name, find the path
            const edges = map.edges();
            const path = edges.find(edge => map.edge(edge) == pathName);
            if (head == path.v)
                this.attributes['Head'] = path.w;
            else if (head == path.w)
                this.attributes['Head'] = path.v;
            else {
                this.response.listen('That is not an exit from your current location.');
                this.emit(':responseReady');
            }
        } else if (destName){ //if we were given a destination, find the room
            if (map.hasEdge(head, destName))
                this.attributes['Head'] = destName;
            else {
                this.response.listen('There is no path from where you are to that location.');
                this.emit(':responseReady');
            }
        }
        this.response.listen('You have moved to ' + map.node(this.attributes['Head']) + ".");
        this.emit(':responseReady');
    },

    //This handler is called if no other handlers can deal with the request.
    'Unhandled' () {
        console.error('problem', this.event);
        this.response.listen('An unhandled problem occurred!');
        this.emit(':responseReady');
    },

    //These are default intents from Amazon.
    'AMAZON.HelpIntent' () {
        this.response.say(instructions);
        this.emit(':responseReady');
    },

    'AMAZON.CancelIntent' () {
        this.response.say('Goodbye!');
        this.emit(':responseReady');
    },

    'AMAZON.StopIntent' () {
        this.response.say('Goodbye!');
        this.emit(':responseReady');
    }
};

//This function creates the map for the player to explore.
//In the future, this will be randomly-generated, but for
//now, it has two rooms with an edge between them.
function makeMap() {
    var map = new graphlib.Graph({
        directed: false
    });
    map.setNode('room 1', 'the first room');
    map.setNode('room 2', 'the second room');
    map.setEdge('room 1', 'room 2', 'stairway');
    return map;
}

//The following two functions are helper functions from the Alexa
//cookbook, accessible at https://github.com/alexa/alexa-cookbook

function sayArray(myData, penultimateWord = 'and') {
    // the first argument is an array [] of items
    // the second argument is the list penultimate word; and/or/nor etc.  Default to 'and'
    let result = '';

    myData.forEach(function(element, index, arr) {
        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}

function isSlotValid(request, slotName){
    var slot = request.intent.slots[slotName];
    //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
    var slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        //we didn't get a value in the slot.
        return false;
    }
}

//This is boilerplate from the Alexa Node SDK docs. It sets
//up an entry point for the skill and registers handlers.
exports.handler = function handler(event, context) {
    const alexa = alexaSDK.handler(event, context);
    alexa.appId = appId;
    //This line sets up DynamoDB integration for persisting
    //skill attributes. See the Alexa Node SDK docs for more.
    alexa.dynamoDBTableName = table;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
