// This script is used to look at arguments on the wait for response nodes
// If we have 'has any of the words' conditions we need to check that there are is no commonality between the words
// This is particularly likely to be a problem following translation
// This script takes in a JSON file exported from RapidPro, extracts the quickreplies, then creates a new set of quick replies with no duplicate words

// Include node.js modules
const { debug } = require('console');
var fs = require('fs');

// Location of JSON to be loaded in
JSONName = 'PLH_FullExport_19-10-21'
JSONPath = __dirname + '/' + JSONName + '.json'

// Location and name of modified JSON file and log file
outputDir = __dirname;
outputJSONPath = __dirname + '/' + JSONName + '_modified.json'
outputfixlogpath = __dirname + '/' + JSONName + '_fixlog.txt'

// Set up variables that are used in the log file
fixlog = ''
TotalFlowCount = 0
TotalModifiedFlows = 0
BiggestFlow = 0
SmallestFlow = 100
TotalNodeCount = 0
TotalModifiedNodes = 0
   
// Calling the readFileSync() method to read json file
var json_string = fs.readFileSync(JSONPath).toString();
// Convert to javascript object to work with
var object = JSON.parse(json_string);
        
// Drill down to find the arguments
for (const flow of object.flows) {
    TotalFlowCount++
    NodeCount = 0
    HasAnyWordNodes = 0
    ModifiedNodes = 0
    ModifiedNodeDetail = ''

    for (const node of flow.nodes) {
        // Check if there is a router in this node if so iterate through the cases
        TotalNodeCount++
        NodeCount++
            
        try {
            for(const cases of node.router.cases){ 
                // First check that there is at least one 'has_any_word' argument and if so set 'fixrequired' to true
                fixrequired = false  
                if(cases.type == "has_any_word"){
                    HasAnyWordNodes++
                    fixrequired = true
                    break
                }
            }
        }            
        catch(err) {
            continue
        }      
            
        // If we need to fix the arguments, 
        if(fixrequired){
            
            // collect all the arguments together into an array
            const originalargs = []
            const originalargtypes = []
            for(const cases of node.router.cases){
                for(const argument of cases.arguments){
                    originalargs.push(argument.trim())                                               
                }
                for(const type of cases.type){
                    originalargtypes.push(type.trim())                                               
                }
            }
            // Process argument and remove duplicate words
            const UniqueArguments = CreateUniqueArguments(originalargs, originalargtypes)

            // If the UniqueArguments are different from the original args, we need to insert these back into the JSON object
            if(arrayEquals(UniqueArguments,originalargs) == false){
                TotalModifiedNodes++
                ModifiedNodes++                
                ModifiedNodeDetail += '        Modified Node: ' + ModifiedNodes + '\n'
                ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                ModifiedNodeDetail += '        Arguments before modification: ' + originalargs + '\n'
                ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'

                i = 0
                for(const cases of node.router.cases){               
                    cases.arguments[0] = UniqueArguments[i];
                    i++      
                }                                                           
            }     
        }                  
    }
    if(ModifiedNodes>0){
        TotalModifiedFlows++
        fixlog += '    Modified Flow: ' + TotalModifiedFlows + '\n'
        fixlog += '    Flow ID: ' + flow.uuid + '\n'
        fixlog += '    Flow name: ' + flow.name + '\n'        
        fixlog += '    Total nodes: ' + NodeCount + '\n'
        fixlog += '    Nodes with "has any words" arguments: ' + HasAnyWordNodes + '\n'
        fixlog += '    Nodes which have been modified due to duplication in arguments: ' + ModifiedNodes + '\n\n'
        fixlog += ModifiedNodeDetail
    }

    if(NodeCount>BiggestFlow){
        BiggestFlow = NodeCount
    }

    if(NodeCount<SmallestFlow){
        SmallestFlow = NodeCount
    }
    
}

//Need to restringify the JS Object so it can be exported as JSON
outputobject = JSON.stringify(object, null, 2)

//Add some text to start of fixlog file
fixlog =    'Log of changes made using the FixingArguments.js script' + '\n\n'
            + 'Input JSON File: ' + JSONPath + '\n\n'
            + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
            + 'Largest flow has: ' + BiggestFlow + ' nodes \n'
            + 'Smallest flow has: ' + SmallestFlow + ' nodes \n'
            + 'Average nodes per flow: ' + Math.round(TotalNodeCount/TotalFlowCount) + '\n'
            + 'Total Modified Flows: ' + TotalModifiedFlows + '\n'
            + 'Total Modified Nodes: ' + TotalModifiedNodes + '\n\n'
            + 'Details of the modified flows/ nodes are summarised below:' + '\n\n'
            + fixlog

// Export modified JSON file and the fixlog file
fs.writeFile(outputJSONPath, outputobject, outputFileErrorHandler)
fs.writeFile(outputfixlogpath, fixlog, outputFileErrorHandler)

function CreateUniqueArguments(originalargs, originalargtypes) {
    var UniqueArguments = []
    var UniqueWords = FindUniqueWords(originalargs)
    let arrayLength = originalargs.length;

    for (let i = 0 ; i < arrayLength; i++){
        if(originalargtypes[i] == "has_any_word"){
            let NewArgument = ""     
            const SplitArguments = originalargs[i].split(" ");
            for (const argumentword of SplitArguments){
                if (CountIf(argumentword,UniqueWords) == 1){                
                    NewArgument += argumentword
                    NewArgument += " "
                }
            }
            UniqueArguments.push(NewArgument.trim())
        } else{
            UniqueArguments.push(originalargs[i])
        }                 
    }
return UniqueArguments
}

function FindUniqueWords(arr) {
    var AllWords = [];
    var UniqueWords = [];
    for (const argument of arr){
        const SplitArguments = argument.split(" ")
        let SplitArgumentsUnique = [...new Set(SplitArguments)]
        for (const argumentword of SplitArgumentsUnique){
            AllWords.push(argumentword)
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

function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }
