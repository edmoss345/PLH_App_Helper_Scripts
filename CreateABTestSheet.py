# -------------------------------------------------------------------------------------------------------------------
# This script is used to rapidly produce entries for the A/B testing spreadsheet
# It takes a JSON file exported from RapidPro
# We enter the piece of text to find and then the new options and conditions based on field criteria
# The output is an excel sheet which can be copied directly into the AB testing master sheet
# -------------------------------------------------------------------------------------------------------------------

# import packages required to run the code
import json
import pandas as pd
# import easygui as eg       # package only required if you want to use the file picker in line 14

# Activate line below if you want to use a file picker to select JSON file
# File = eg.fileopenbox()

# Activate line below if you want specify JSON file path as string
File = r"C:\Users\edmun\OneDrive - EEM Engineering Ltd\IDEMS\GG-plh-international-flavour.json"

# Input variables, based on info required AB testing sheet
TypeofEdit = "replace_bit_of_text"
Change = "child or teen"        # this is the bit of text that we are going to search for in the JSON file
ConditionVariable = "@fields.age_group_for_tips"        # this field is checked against the Op#Condition fields
Op1Condition = "child"
Op1ConditionType = "has_any_word"
Op1ReplacementText = "child"
Op2Condition = "teen"
Op2ConditionType = "has_any_word"
Op2ReplacementText = "teen"

# Setup two empty lists, these will be populated when we find matches to the 'Change' text
flow_match = []     # name of the flow where we have found a match to the 'Change' text
text_match = []     # full paragraph which contains the 'Change' text

# Load the json file into python
with open(File) as jsonFile:
    jsonObject = json.load(jsonFile)
    jsonFile.close()

FlowCount = (len(jsonObject['flows']))      # Total number of flows in JSON object
for i in range(FlowCount):      # Loop through all flows in JSON object

    NodeCount = (len(jsonObject['flows'][i]['nodes']))      # Total number of nodes in Flow 'i'
    for j in range(NodeCount):      # Loop through all of the nodes in the flow

        ActionCount = (len(jsonObject['flows'][i]['nodes'][j]['actions']))      # Total number of actions in Flow 'i', Node 'j'
