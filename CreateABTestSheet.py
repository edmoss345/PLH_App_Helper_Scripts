"""
This script is used to rapidly produce entries for the A/B testing spreadsheet
It takes a JSON file exported from RapidPro
We enter the piece of text to find and then the new options and conditions based on field criteria
The script looks for text in the following places
   flows>nodes>actions>text
   flows>nodes>actions>quick replies
   flows>nodes>router>cases>arguments
   flows>nodes>router>categories>name
The output is an excel sheet which can be copied directly into the AB testing master sheet (branch test)
"""

"""import packages required to run the code"""
import json
import pandas as pd
# import easygui as eg       # package only required if you want to use the file picker in line 17, deactivated

"""Activate line below if you want to use a file picker to select JSON file"""
# File = eg.fileopenbox()

"""Activate line below if you want specify JSON file path as string"""
File = r"C:\Users\edmun\OneDrive - EEM Engineering Ltd\IDEMS\GG-plh-international-flavour.json"

"""Input variables, based on info required AB testing sheet"""
Change = "child or teen"        # this is the bit of text that we are going to search for in the JSON file
ConditionVariable = "@fields.age_group_for_tips"        # this field is checked against the Op#Condition fields
Op1Condition = "child"
Op1ConditionType = "has_any_word"
Op1Category = "child"
Op2Condition = "teen"
Op2ConditionType = "has_any_word"
Op2Category = "teen"

"""Setup two empty lists, these will be populated when we find matches to the 'Change' text"""
type_of_edit = []   # type of edit used in the AB sheet
flow_match = []     # name of the flow where we have found a match to the 'Change' text
text_match = []     # full paragraph which contains the 'Change' text

"""Load the json file into python"""
with open(File) as jsonFile:
    jsonObject = json.load(jsonFile)
    jsonFile.close()

"""Loop through relevant fields in json file"""
FlowCount = (len(jsonObject['flows']))      # Total number of flows in JSON object
for i in range(FlowCount):      # Loop through all flows in JSON object

    NodeCount = (len(jsonObject['flows'][i]['nodes']))      # Total number of nodes in Flow i
    for j in range(NodeCount):      # Loop through all of the nodes in the flow

        ActionCount = (len(jsonObject['flows'][i]['nodes'][j]['actions']))      # Total number of actions in Node 'j'

        """Loop through the actions and look for a 'text' field"""
        for k in range(ActionCount):  # Loop through all of the actions in the node
            try:
                samplestring = jsonObject['flows'][i]['nodes'][j]['actions'][k]['text']     # Extract 'text' contents
                if Change in samplestring:
                    type_of_edit.append("replace_bit_of_text")
                    text_match.append(samplestring)     # If we have a match, record the samplestring
                    flow_match.append(jsonObject['flows'][i]['name'])       # If we have a match, record the flow name
            except:
                continue

        """Loop through the actions and look for a 'quick replies' field"""
        for k in range(ActionCount):  # Loop through all of the actions in the node
            try:
                QuickReplyCount = len(jsonObject['flows'][i]['nodes'][j]['actions'][k]['quick_replies'])    # Count of quick replies
                for m in range(QuickReplyCount):  # Loop through all of the quick replies
                    samplestring = jsonObject['flows'][i]['nodes'][j]['actions'][k]['quick_replies'][m]     # Extract 'quick replies' contents
                    if Change in samplestring:
                        type_of_edit.append("replace_quick_replies")
                        text_match.append(samplestring)     # If we have a match, record the samplestring
                        flow_match.append(jsonObject['flows'][i]['name'])       # If we have a match, record the flow name
            except:
                continue

        """Loop through the nodes and look for 'router>cases>arguments'"""
        try:
            CasesCount = len(jsonObject['flows'][i]['nodes'][j]['router']['cases'])  # Number of cases in router
            for n in range(CasesCount):  # Loop through all of the cases in a router
                try:
                    ArgumentCount = len(jsonObject['flows'][i]['nodes'][j]['router']['cases'][n]['arguments'])  # Number of arguments in case
                    for p in range(ArgumentCount):  # Loop through all the arguments in a case
                        samplestring = jsonObject['flows'][i]['nodes'][j]['router']['cases'][n]['arguments'][p]
                        if Change in samplestring:
                            type_of_edit.append("replace_arguments")
                            text_match.append(samplestring)     # If we have a match, record the samplestring
                            flow_match.append(jsonObject['flows'][i]['name'])       # If we have a match, record the flow name
                except:
                    continue
        except:
            continue

        """Loop through the nodes and look for 'router>categories>name'"""
        try:
            CategoriesCount = len(jsonObject['flows'][i]['nodes'][j]['router']['categories'])  # Number of categories in router
            for q in range(CategoriesCount):  # Loop through all of the categories in a router
                try:
                    samplestring = jsonObject['flows'][i]['nodes'][j]['router']['categories'][q]['name']
                    if Change in samplestring:
                        type_of_edit.append("replace_categories")
                        text_match.append(samplestring)     # If we have a match, record the samplestring
                        flow_match.append(jsonObject['flows'][i]['name'])       # If we have a match, record the flow name
                except:
                    continue
        except:
            continue

OutputData = pd.DataFrame(zip(type_of_edit, flow_match, text_match), columns=['type_of_edit', 'flow_id', 'node_identifier'])

OutputData.insert(2, "original_row_id", "")
OutputData.insert(4, "change", Change)
OutputData.insert(5, "condition_var", ConditionVariable)
OutputData.insert(6, "category", Change)
OutputData.insert(7, "category:"+Op1Category, Op1Category)
OutputData.insert(8, "condition:"+Op1Category, Op1Condition)
OutputData.insert(9, "condition_type:"+Op1Category, Op1ConditionType)
OutputData.insert(10, "category:"+Op2Category, Op2Category)
OutputData.insert(11, "condition:"+Op2Category, Op2Condition)
OutputData.insert(12, "condition_type:"+Op2Category, Op2ConditionType)

OutputData.to_excel("ABTesting-"+Change+".xlsx", index=False)





