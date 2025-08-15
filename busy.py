
import os
import time
import random

# Create a directory for the fake project
if not os.path.exists("fake_project"):
    os.makedirs("fake_project")

os.chdir("fake_project")

# Loop to generate a lot of files
for i in range(1, 101):
    # Generate a random language extension
    lang_ext = ["js", "py", "java", "c", "cpp", "go", "rs", "swift", "kt", "php", "rb", "pl", "sh", "html", "css"]
    rand_ext = random.choice(lang_ext)

    # Create a file with some fake code
    file_name = f"file{i}.{rand_ext}"
    print(f"Generating file {file_name}...")
    with open(file_name, "w") as f:
        f.write(f"// Fake code file {i}\n")
        f.write("// This is just some dummy code to look busy\n")
        f.write("function hello_world() {\n")
        f.write("  console.log('Hello, world!');\n")
        f.write("}\n")
        f.write("\n")
        f.write("hello_world();\n")

    # Sleep for a short time to make it look like work is being done
    time.sleep(0.1)

print("Done generating fake code!")
