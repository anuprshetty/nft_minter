import os
import json


# NFT metadata generation

image_folder_cid = "QmUigaPTRSTNvtcReHu6he1t7oa16i9vGoi4KR1bWY68w7"

folder_path = os.path.join(os.path.dirname(__file__), "tom_jerry_metadata")
num_copies = 50

if not os.path.exists(folder_path):
    os.makedirs(folder_path)

for i in range(1, num_copies+1):
    nft_metadata = {
        "name": f"#{i} - Tom and Jerry NFT Image",
        "description": "Tom and Jerry NFT Collection",
        "image": f"ipfs://{image_folder_cid}/{i}.png",
        "edition": "1",
        "attributes": [
            {
                "trait_type": "Background",
                "value": "white",
            },
            {
                "trait_type": "Tom Color",
                "value": "Gray",
            },
            {
                "trait_type": "Jerry Color",
                "value": "Brown",
            }
        ]
    }

    new_file_path = os.path.join(folder_path, str(i) + ".json")
    with open(new_file_path, "w", encoding="utf-8") as f:
        json.dump(nft_metadata, f, indent=4)
