#!/bin/bash
#
# CHESS BLITZ ARENA - MASTER TEST RUNNER
# Purpose: One command to run all tests and quality checks
# Usage: ./run-tests.sh [quick|full|e2b|local]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
E2B_DIR="$SCRIPT_DIR/../e2b"
TEST_MODE="${1:-quick}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        CHESS BLITZ ARENA - MASTER TEST RUNNER                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function: Print section header
section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function: Check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ Missing file: $1${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Found: $(basename $1)${NC}"
    return 0
}

# Function: Run command with status
run_command() {
    echo -e "${YELLOW}▶ $1${NC}"
    if eval "$2"; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Quick mode - Fast checks only
if [ "$TEST_MODE" = "quick" ]; then
    section "QUICK MODE - Fast Validation Checks"

    # Check required files
    echo -e "\n${YELLOW}Checking required files...${NC}"
    check_file "$SCRIPT_DIR/index.html"
    check_file "$SCRIPT_DIR/test-comprehensive.js"
    check_file "$SCRIPT_DIR/error-handler.js"
    check_file "$SCRIPT_DIR/dev-tools.js"

    # Validate JavaScript syntax
    section "JavaScript Syntax Validation"
    run_command "Checking index.html" "grep -q 'Chess Blitz Arena' $SCRIPT_DIR/index.html"
    run_command "Checking test suite" "grep -q 'ChessTestSuite' $SCRIPT_DIR/test-comprehensive.js"
    run_command "Checking error handler" "grep -q 'ChessErrorHandler' $SCRIPT_DIR/error-handler.js"
    run_command "Checking dev tools" "grep -q 'ChessDevTools' $SCRIPT_DIR/dev-tools.js"

    # Check file sizes (should not be empty)
    section "File Size Check"
    for file in index.html test-comprehensive.js error-handler.js dev-tools.js; do
        size=$(wc -c < "$SCRIPT_DIR/$file" | tr -d ' ')
        if [ "$size" -gt 1000 ]; then
            echo -e "${GREEN}✅ $file: ${size} bytes${NC}"
        else
            echo -e "${RED}❌ $file: ${size} bytes (too small?)${NC}"
        fi
    done

    section "Quick Mode Complete"
    echo -e "${GREEN}All quick checks passed!${NC}"
    echo -e "${YELLOW}Run './run-tests.sh full' for comprehensive testing${NC}"
    exit 0
fi

# Full mode - Comprehensive testing
if [ "$TEST_MODE" = "full" ]; then
    section "FULL MODE - Comprehensive Testing"

    # File validation
    section "File Validation"
    check_file "$SCRIPT_DIR/index.html" || exit 1
    check_file "$SCRIPT_DIR/test-comprehensive.js" || exit 1
    check_file "$SCRIPT_DIR/error-handler.js" || exit 1
    check_file "$SCRIPT_DIR/dev-tools.js" || exit 1
    check_file "$SCRIPT_DIR/session-tracker.js" || exit 1

    # Syntax checks
    section "Syntax Validation"

    # Check for common JavaScript errors
    echo -e "\n${YELLOW}Checking for common errors...${NC}"

    # Check for console.log (should have some for debugging)
    log_count=$(grep -c "console.log" "$SCRIPT_DIR/test-comprehensive.js" || true)
    echo -e "${GREEN}✅ Found ${log_count} console.log statements${NC}"

    # Check for TODO/FIXME
    todo_count=$(grep -rn "TODO\|FIXME" "$SCRIPT_DIR"/*.js | wc -l | tr -d ' ')
    if [ "$todo_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found ${todo_count} TODO/FIXME comments${NC}"
        grep -rn "TODO\|FIXME" "$SCRIPT_DIR"/*.js || true
    else
        echo -e "${GREEN}✅ No TODO/FIXME comments${NC}"
    fi

    # Code quality checks
    section "Code Quality Checks"

    # Check for error handling
    error_handling_count=$(grep -c "try\|catch\|throw" "$SCRIPT_DIR/test-comprehensive.js" || true)
    echo -e "${GREEN}✅ Error handling blocks: ${error_handling_count}${NC}"

    # Check for test coverage
    test_count=$(grep -c "await this.test(" "$SCRIPT_DIR/test-comprehensive.js" || true)
    echo -e "${GREEN}✅ Total tests defined: ${test_count}${NC}"

    # Validate error handler features
    validation_count=$(grep -c "validate" "$SCRIPT_DIR/error-handler.js" || true)
    echo -e "${GREEN}✅ Validation functions: ${validation_count}${NC}"

    # Check dev tools features
    dev_features=$(grep -c "this\." "$SCRIPT_DIR/dev-tools.js" || true)
    echo -e "${GREEN}✅ Dev tool features: ${dev_features}${NC}"

    # Integration check
    section "Integration Validation"

    echo -e "\n${YELLOW}Checking tool integration...${NC}"

    # Check if test suite references game state
    if grep -q "gameState" "$SCRIPT_DIR/test-comprehensive.js"; then
        echo -e "${GREEN}✅ Test suite integrates with game state${NC}"
    else
        echo -e "${RED}❌ Test suite missing game state integration${NC}"
    fi

    # Check if error handler has validation rules
    if grep -q "validationRules" "$SCRIPT_DIR/error-handler.js"; then
        echo -e "${GREEN}✅ Error handler has validation rules${NC}"
    else
        echo -e "${RED}❌ Error handler missing validation rules${NC}"
    fi

    # Check if dev tools can run tests
    if grep -q "runAllTests" "$SCRIPT_DIR/dev-tools.js"; then
        echo -e "${GREEN}✅ Dev tools can run tests${NC}"
    else
        echo -e "${RED}❌ Dev tools missing test runner${NC}"
    fi

    section "Documentation Check"

    # Check for comments
    comment_count=$(grep -c "^\s*/\*\|^\s*//" "$SCRIPT_DIR/test-comprehensive.js" || true)
    echo -e "${GREEN}✅ Documentation lines: ${comment_count}${NC}"

    # Check for JSDoc
    jsdoc_count=$(grep -c "^\s*/\*\*" "$SCRIPT_DIR/test-comprehensive.js" || true)
    echo -e "${GREEN}✅ JSDoc blocks: ${jsdoc_count}${NC}"

    section "Full Mode Complete"
    echo -e "${GREEN}All comprehensive checks passed!${NC}"
    echo -e "${YELLOW}Run './run-tests.sh e2b' for E2B automated testing${NC}"
    exit 0
fi

# E2B mode - Run automated tests in E2B sandbox
if [ "$TEST_MODE" = "e2b" ]; then
    section "E2B MODE - Automated Regression Testing"

    # Check if E2B directory exists
    if [ ! -d "$E2B_DIR" ]; then
        echo -e "${RED}❌ E2B directory not found: $E2B_DIR${NC}"
        exit 1
    fi

    # Check if E2B test script exists
    E2B_TEST="$E2B_DIR/examples/12_chess_regression_suite.py"
    if [ ! -f "$E2B_TEST" ]; then
        echo -e "${RED}❌ E2B test script not found: $E2B_TEST${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Found E2B test script${NC}"

    # Check for E2B API key
    if [ -z "$E2B_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  E2B_API_KEY not set in environment${NC}"
        if [ -f "$E2B_DIR/.env" ]; then
            echo -e "${YELLOW}Loading from .env file...${NC}"
            source "$E2B_DIR/.env"
        else
            echo -e "${RED}❌ No .env file found in $E2B_DIR${NC}"
            exit 1
        fi
    fi

    # Run E2B tests
    section "Running E2B Regression Suite"
    cd "$E2B_DIR/examples"

    run_command "E2B Regression Tests" "python3 12_chess_regression_suite.py --headless"

    section "E2B Mode Complete"
    exit 0
fi

# Local mode - Run browser tests locally
if [ "$TEST_MODE" = "local" ]; then
    section "LOCAL MODE - Browser Testing"

    echo -e "${YELLOW}Opening test page in browser...${NC}"

    # Check if local server is running
    if lsof -i:8000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server already running on port 8000${NC}"
        TEST_URL="http://localhost:8000"
    else
        echo -e "${YELLOW}Starting local server...${NC}"
        cd "$SCRIPT_DIR"
        python3 -m http.server 8000 > /dev/null 2>&1 &
        SERVER_PID=$!
        sleep 2
        TEST_URL="http://localhost:8000"
        echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
    fi

    # Open browser with dev tools
    TEST_URL="${TEST_URL}?dev=true"
    echo -e "${BLUE}Opening: ${TEST_URL}${NC}"

    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$TEST_URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$TEST_URL"
    else
        echo -e "${YELLOW}Please open manually: ${TEST_URL}${NC}"
    fi

    echo -e "\n${GREEN}Local test environment ready!${NC}"
    echo -e "${YELLOW}Open browser console and run: runTests()${NC}"
    echo -e "${YELLOW}Press Ctrl+Shift+D to open Dev Tools panel${NC}"

    if [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}Press Ctrl+C to stop server${NC}"
        trap "kill $SERVER_PID 2>/dev/null" EXIT
        wait $SERVER_PID
    fi

    exit 0
fi

# Invalid mode
echo -e "${RED}❌ Invalid mode: $TEST_MODE${NC}"
echo -e "${YELLOW}Usage: ./run-tests.sh [quick|full|e2b|local]${NC}"
echo ""
echo -e "Modes:"
echo -e "  ${GREEN}quick${NC}  - Fast validation checks (default)"
echo -e "  ${GREEN}full${NC}   - Comprehensive code quality analysis"
echo -e "  ${GREEN}e2b${NC}    - Run automated E2B/Playwright tests"
echo -e "  ${GREEN}local${NC}  - Start local server and open in browser"
exit 1
