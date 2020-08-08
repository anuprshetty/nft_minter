import os
from shutil import copyfile


# NFT images generation

file_path = os.path.join(os.path.dirname(__file__), "tom_and_jerry.png")
folder_path = os.path.join(os.path.dirname(__file__), "tom_jerry_images")
num_copies = 50

if not os.path.exists(folder_path):
    os.makedirs(folder_path)

for i in range(num_copies):
    new_file_path = os.path.join(folder_path, str(i+1) + ".png")
    copyfile(file_path, new_file_path)
