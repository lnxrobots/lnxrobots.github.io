import os
import shutil
from PIL import Image

IMAGES_FOLDER = 'images/gallery/img/'
THUMBNAIL_FOLDER = 'images/gallery/thumb/'

if os.path.isdir(THUMBNAIL_FOLDER):
    shutil.rmtree(THUMBNAIL_FOLDER)

os.mkdir(THUMBNAIL_FOLDER)
for f in os.listdir(IMAGES_FOLDER):
    image = Image.open(os.path.join(IMAGES_FOLDER, f))
    image.thumbnail((800, 800))
    image.save(os.path.join(THUMBNAIL_FOLDER, f))
