import os
from PIL import Image

cars_dir = "assets/cars"
for filename in os.listdir(cars_dir):
    if filename.endswith(".png"):
        filepath = os.path.join(cars_dir, filename)
        orig_size = os.path.getsize(filepath)
        try:
            with Image.open(filepath) as img:
                # Check dimensions
                w, h = img.size
                if w > 1024 or h > 1024:
                    # Resize to max 1024
                    img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                
                # If it doesn't need transparency, converting to RGB can save space, 
                # but let's keep RGBA mode to avoid breaking transparency if it exists,
                # and save with optimization and compression_level=9
                img.save(filepath, "PNG", optimize=True, compress_level=9)
            
            new_size = os.path.getsize(filepath)
            print(f"Compressed {filename}: {orig_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB")
        except Exception as e:
            print(f"Error compressing {filename}: {e}")
