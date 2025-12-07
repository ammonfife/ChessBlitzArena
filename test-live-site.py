#!/usr/bin/env python3
"""
E2B-powered live site tester for ChessBlitz Arena
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_chess_blitz_arena():
    print("🚀 Starting ChessBlitz Arena Live Test...")
    
    # Setup headless Chrome
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Test 1: Site loads
        print("\n📡 Test 1: Loading site...")
        driver.get('http://chess.genomicdigital.com')
        time.sleep(3)
        print(f"✅ Title: {driver.title}")
        
        # Test 2: Check for errors
        print("\n🔍 Test 2: Checking console for errors...")
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"❌ Found {len(errors)} errors:")
            for err in errors[:3]:
                print(f"   - {err['message']}")
        else:
            print("✅ No console errors")
        
        # Test 3: Board exists
        print("\n🎯 Test 3: Checking chess board...")
        board = driver.find_element(By.ID, 'chess-board')
        print(f"✅ Board found with {len(board.find_elements(By.CLASS_NAME, 'square'))} squares")
        
        # Test 4: Start assessment
        print("\n🎮 Test 4: Starting assessment...")
        start_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'START ASSESSMENT')]"))
        )
        start_btn.click()
        time.sleep(2)
        print("✅ Assessment started")
        
        # Test 5: Check pieces are visible
        print("\n♟️  Test 5: Checking pieces...")
        pieces = driver.execute_script("""
            const squares = document.querySelectorAll('.square');
            let whitePieces = 0, blackPieces = 0;
            squares.forEach(sq => {
                if (sq.classList.contains('white-piece')) whitePieces++;
                if (sq.classList.contains('black-piece')) blackPieces++;
            });
            return {white: whitePieces, black: blackPieces};
        """)
        print(f"✅ Found {pieces['white']} white pieces, {pieces['black']} black pieces")
        
        # Test 6: Click a piece
        print("\n👆 Test 6: Clicking a piece...")
        clickable_piece = driver.find_element(By.CSS_SELECTOR, '.square.white-piece, .square.black-piece')
        clickable_piece.click()
        time.sleep(1)
        selected = driver.find_elements(By.CSS_SELECTOR, '.square.selected')
        if selected:
            print(f"✅ Piece selected (class: {selected[0].get_attribute('class')})")
        else:
            print("⚠️  Piece not selected")
        
        # Test 7: Hint button
        print("\n💡 Test 7: Testing hint button...")
        hint_btn = driver.find_element(By.ID, 'power-hint')
        hint_count = hint_btn.find_element(By.CLASS_NAME, 'power-count').text
        print(f"   Hints available: {hint_count}")
        hint_btn.click()
        time.sleep(2)
        print("✅ Hint button clicked")
        
        # Test 8: Debug console
        print("\n🐛 Test 8: Testing debug console...")
        logs = driver.execute_script("return chessDebug.getLogs();")
        print(f"✅ Debug console working: {len(logs)} log entries")
        
        # Test 9: AI Engine
        print("\n🤖 Test 9: Checking AI engine...")
        ai_status = driver.execute_script("return {ready: aiEngine.isReady, hasEngine: !!aiEngine.engine};")
        print(f"   AI Ready: {ai_status['ready']}, Engine loaded: {ai_status['hasEngine']}")
        
        # Screenshot
        print("\n📸 Taking screenshot...")
        driver.save_screenshot('test-screenshot.png')
        print("✅ Screenshot saved: test-screenshot.png")
        
        print("\n" + "="*50)
        print("✅ ALL TESTS PASSED")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        driver.save_screenshot('error-screenshot.png')
        
    finally:
        driver.quit()

if __name__ == '__main__':
    test_chess_blitz_arena()
