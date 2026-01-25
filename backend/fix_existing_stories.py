import os
import json

# Define paths relative to this script or project root
# Assuming this script is in backend/ and stories are in story_generated/ (sibling to backend)
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # .../test-main/backend
PROJECT_ROOT = os.path.dirname(BASE_DIR)
STORIES_DIR = os.path.join(PROJECT_ROOT, "story_generated")
TEMPLATE_PATH = os.path.join(BASE_DIR, "template_site.html")

def fix_stories():
    if not os.path.exists(STORIES_DIR):
        print(f"Stories directory not found at {STORIES_DIR}")
        return

    if not os.path.exists(TEMPLATE_PATH):
        print(f"Template not found at {TEMPLATE_PATH}")
        return

    # Read template once
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as t:
        template_content = t.read()

    print(f"Scanning {STORIES_DIR}...")
    
    count = 0
    for folder_name in os.listdir(STORIES_DIR):
        folder_path = os.path.join(STORIES_DIR, folder_name)
        json_path = os.path.join(folder_path, "story.json")
        html_path = os.path.join(folder_path, "index.html")

        if os.path.isdir(folder_path) and os.path.exists(json_path):
            try:
                # Read story data
                with open(json_path, "r", encoding="utf-8") as f:
                    story_data = json.load(f)
                
                # Prepare injection
                # We need to ensure the image paths are relative for local file opening if they aren't already
                # But typically main.py saves them as filenames in the same folder, so they are relative.
                # However, the saved JSON might have /stories/ID/image.png
                
                # Let's fix paths for standalone usage just in case
                # If the image path starts with /stories/FOLDER/, we should strip it to just the filename
                # because the HTML is in the same folder as the images.
                
                fixed_cover = story_data.get("cover_image", "")
                if "/" in fixed_cover:
                    fixed_cover = fixed_cover.split("/")[-1]
                story_data["cover_image"] = fixed_cover

                if "chapters" in story_data:
                    for chap in story_data["chapters"]:
                        img = chap.get("image", "")
                        if "/" in img:
                            chap["image"] = img.split("/")[-1]

                # Inject
                json_str = json.dumps(story_data, ensure_ascii=False)
                injection_code = f"window.embeddedStory = {json_str};"
                
                new_html = template_content.replace("// __STORY_DATA_INJECTION__", injection_code)
                
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(new_html)
                
                print(f"Fixed: {folder_name}")
                count += 1

            except Exception as e:
                print(f"Error fixing {folder_name}: {e}")

    print(f"Finished. Fixed {count} stories.")

if __name__ == "__main__":
    fix_stories()
