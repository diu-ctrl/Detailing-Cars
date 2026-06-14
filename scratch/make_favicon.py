import os
from PIL import Image

def make_favicon():
    img_path = 'assets/logo.png'
    out_path = 'assets/logo_square.png'
    
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return
        
    img = Image.open(img_path)
    width, height = img.size
    
    # Calculate square size
    size = max(width, height)
    
    # Create transparent square background
    square_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Calculate position to center the logo
    x = (size - width) // 2
    y = (size - height) // 2
    
    # Paste the logo
    square_img.paste(img, (x, y))
    
    # Save the output
    square_img.save(out_path)
    print(f"Saved square favicon to {out_path} ({size}x{size})")

if __name__ == '__main__':
    make_favicon()
