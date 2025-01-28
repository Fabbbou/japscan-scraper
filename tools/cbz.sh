#!/bin/bash

# Default starting chapter number
DEFAULT_START_CHAPTER=1

# Function to print usage
print_usage() {
  echo "Usage: $0 <input_directory> <output_directory> [start_chapter_number]"
  echo "  <input_directory>       Directory containing the chapters"
  echo "  <output_directory>      Directory to save the CBZ files"
  echo "  [start_chapter_number]  Optional: Chapter number to start from (default: $DEFAULT_START_CHAPTER)"
}

# Check if at least two parameters are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  print_usage
  exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"
START_CHAPTER="${3:-$DEFAULT_START_CHAPTER}"

# Check if input directory exists
if [ ! -d "$INPUT_DIR" ]; then
  echo "The input directory does not exist."
  exit 1
fi

# Check if output directory exists, if not create it
if [ ! -d "$OUTPUT_DIR" ]; then
  echo "The output directory does not exist. Creating it..."
  mkdir -p "$OUTPUT_DIR"
fi

# Iterate through each folder in the input directory
for FOLDER in "$INPUT_DIR"/*/; do
  # Check if it's a directory
  if [ -d "$FOLDER" ]; then
    # Get the folder name and make it lowercase
    FOLDER_NAME=$(basename "$FOLDER")
    
    # Extract the chapter number from the folder name
    CHAPTER_NUMBER=$(echo "$FOLDER_NAME" | grep -o -E '[0-9]+' | tr -d '\n')
    
    # Check if the chapter number is greater than or equal to the starting chapter number
    if [ "$CHAPTER_NUMBER" -ge "$START_CHAPTER" ]; then
      # Define the output CBZ file path
      OUTPUT_CBZ="$OUTPUT_DIR/$FOLDER_NAME.cbz"

      # Create the CBZ file
      zip -jrq "$OUTPUT_CBZ" "$FOLDER"/*
      
      # Check if the CBZ file was created successfully
      if [ -f "$OUTPUT_CBZ" ]; then
        echo "CBZ file created: $OUTPUT_CBZ"
      else
        echo "Failed to create CBZ file."
      fi
    fi
  fi
done

echo "All CBZ files have been created in $OUTPUT_DIR"