import json
import os
import re

dir_path = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(dir_path, 'tft.json'), 'r') as f:
    data = json.load(f)


def get_silver_gold_prismatic():
    silver_gold_prismatic = []
    items = filter_augments(data["items"])
    for item in items:
        icon: str = item["icon"]
        icon = icon.split("ASSETS/Maps/TFT/Icons/Augments/Hexcore/")[1]

        categorized = categorize_icon(icon)
        item["augmentQuality"] = categorized

    for og_item in data['items']:
        for item in items:
            if item['apiName'] == og_item['apiName']:
                og_item['augmentQuality'] = item['augmentQuality']

            # print(og_item['augmentQuality'])
    for item in data['items']:
        if 'augmentQuality' not in item:
            item['augmentQuality'] = 'uncategorized'

    with open(os.path.join(dir_path, 'tft_new.json'), 'w') as f:
        json.dump(data, f, indent=2)
    return silver_gold_prismatic


def filter_augments(items):
    augments = [item for item in items if re.match(
        r"TFT\d+_Augment", item["apiName"])]

    augments = [item for item in augments if item['icon'].startswith(
        'ASSETS/Maps/TFT/Icons/Augments/Hexcore/')]
    return augments


def categorize_icon(icon: str):
    mapping = {"1": "Silver", "2": "Gold", "3": "Prismatic",
               "I": "Silver", "II": "Gold", "III": "Prismatic"}

    match = re.search(r'(1|2|3|I{1,3})', icon)

    if match:
        s = match.group(1)
        if s in mapping:
            return mapping[s]
    else:
        return "uncategorized"


if __name__ == '__main__':
    get_silver_gold_prismatic()
