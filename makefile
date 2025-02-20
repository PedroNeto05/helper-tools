# Directories
SRC_DIR = src-python/src
BIN_DIR = bin

# Get target triple from rustc
TARGET_TRIPLE := $(shell rustc -Vv | grep host | cut -f2 -d' ')

# Find all Python files recursively
PYTHON_FILES := $(shell find $(SRC_DIR) -type f -name "*.py")
# Generate target executables paths with target triple suffix
TARGETS := $(patsubst $(SRC_DIR)/%.py,$(BIN_DIR)/%-$(TARGET_TRIPLE),$(PYTHON_FILES))

.PHONY: all clean

all: $(TARGETS)

# Rule to compile Python files
$(BIN_DIR)/%-$(TARGET_TRIPLE): $(SRC_DIR)/%.py
	@mkdir -p $(dir $@)
	pyinstaller --onefile --clean --distpath $(dir $@) $< --name $(notdir $@)
	@rm -rf build *.spec

clean:
	@rm -rf $(BIN_DIR)/* build/ dist/ *.spec __pycache__/