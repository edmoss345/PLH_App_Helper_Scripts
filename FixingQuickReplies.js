// This script is used to look at quick replies within the PLH app
// As part of the App Build process, we sometime need to convert quick replies to text inputs
// In this instance we need to reformat the quick replies so that there are no duplicate words between them
// This script takes in a JSON file exported from RapidPro, extracts the quickreplies, then creates a new set of quick replies with no duplicate words

// Include fs module used to import a JSON file
const { debug } = require('console');
var fs = require('fs');
   
// Calling the readFileSync() method to read json file
var json_string = fs.readFileSync('./em-playground.json').toString();
// Convert to javascript object to work with
var object = JSON.parse(json_string);
        
// Drill down to find the quick replies
for (const flow of object.flows) {
    for (const node of flow.nodes) {
        for (const action of node.actions) {
            // Check if there are quick replies in this action
            try {
                if(action.quick_replies.length > 0){
                    // Quick replies found, store in an array to then work with
                    const arr = action.quick_replies;
                    const UniqueQuickReplies = CreateUniqueQuickReplies(arr)
                    console.log(arr)
                    console.log(UniqueQuickReplies);              
                    }
                }            
            catch(err) {
                continue
            }
        }
    }
}

function CreateUniqueQuickReplies(arr) {
    var UniqueQuickReplies = []
    var counter = 1
    UniqueWords = FindUniqueWords(arr)

    for (const replies of arr){
        var NewReply = counter.toString();
        const SplitReplies = replies.split(" ");
        for (const replyword of SplitReplies){
            if (CountIf(replyword,UniqueWords) == 1){
                NewReply += " "
                NewReply += replyword
            }
        }
        UniqueQuickReplies.push(NewReply)
        counter++
    }
return UniqueQuickReplies
}


function FindUniqueWords(arr) {
    var AllWords = [];
    var UniqueWords = [];
    for (const replies of arr){
        const SplitReplies = replies.split(" ")
        for (const replyword of SplitReplies){
            AllWords.push(replyword)
        }
    }
    for (const word of AllWords){
        if(CountIf(word, AllWords) == 1){
            UniqueWords.push(word)
        }
    }
    return UniqueWords
}


function CountIf(string, arr) {
    var counter = 0
    for (const member of arr){
        if (string == member){
            counter++
        }
    }
    return counter
}



