# Slot Machine Game - Basic Operations Test Plan (Revised)

## Application Overview

This test plan covers the basic operations of the Slot Machine demo game (by BGaming) hosted on Casino.Guru. The game is a 3x3 fruit-themed slot machine with a starting balance of 1,000.00 FUN (virtual currency) in demo mode. The game interface includes the following controls: Balance display (1,000.00 FUN) on the bottom left, Total bet display (0.10 FUN) with up/down arrows in the center bottom, Info Icon and Settings button on the left side, Sound control icon at the top right, Spin button (main gameplay control), Autoplay button (circular "A" icon) at the bottom right, and Buy Bonus button (gold button showing 6.00 FUN). This test plan validates game initialization, all UI controls, balance tracking before and after gameplay, and bet amount validation.

## Test Scenarios

### 1. Game Initialization and UI Controls

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify game loads successfully with initial balance and all UI controls

**File:** `tests/slot-machine/initialization.spec.ts`

**Steps:**
  1. Navigate to the Slot Machine game URL: https://casino.guru/free-casino-games/slots/slot-machine-slot-play-free
    - expect: The Casino.Guru website loads
    - expect: The Slot Machine game page is displayed
  2. Click on the 'Play for Free' button to launch the game
    - expect: The game iframe loads successfully
    - expect: The Slot Machine game interface is fully displayed with all controls
  3. Wait for the game to fully initialize
    - expect: The game loading completes
    - expect: The 3x3 slot machine reels are visible and display fruit symbols (oranges, bonus symbols, 7s, watermelons, cherries, etc.)
  4. Verify the initial balance amount is 1,000.00 FUN
    - expect: Balance display shows '1,000.00 FUN'
    - expect: Balance is clearly visible in the bottom left of the game interface
  5. Verify the initial bet amount is 0.10 FUN
    - expect: Total bet shows '0.10 FUN'
    - expect: The bet amount is displayed in the center of the bottom game control area
  6. Verify information/help controls are visible
    - expect: Info Icon (information button) is visible on the top left corner of the control panel
    - expect: Help Icon is visible below the Info Icon
    - expect: Settings button (gear icon) is visible on the left side of the control panel
  7. Verify sound control is visible at top right
    - expect: Sound control icon (speaker) is clearly visible at the top right of the game
    - expect: The sound icon shows the current state (active or muted)
  8. Verify the main Spin button is available
    - expect: Spin button is clearly visible and interactive (main control for gameplay)
    - expect: The spin button appears clickable and ready for interaction
  9. Verify the Autoplay button is visible at bottom right
    - expect: Autoplay button (circular icon with 'A') is visible at the bottom right of the control area
    - expect: The autoplay button appears clickable
  10. Verify the Buy Bonus button with current bonus amount is visible
    - expect: Buy Bonus button (gold/yellow colored) is visible on the right side of the machine
    - expect: The bonus button displays the current bonus amount (showing '6.00 FUN' or similar)
    - expect: The button appears interactive

#### 1.2. Verify sound control functionality

**File:** `tests/slot-machine/sound-control.spec.ts`

**Steps:**
  1. Locate the sound toggle button (speaker icon) at the top right of the game interface
    - expect: The sound icon is clearly visible at the top right of the game
    - expect: The sound icon shows the current state (speaker icon for sound on)
  2. Click on the sound toggle button to mute the sound
    - expect: The sound icon changes appearance
    - expect: The click action registers successfully
  3. Verify the sound has been toggled to muted state
    - expect: The sound icon changes to show muted state (e.g., speaker with slash or different appearance)
    - expect: The muted state is clearly visible
  4. Click on the sound toggle button again to restore sound
    - expect: The sound icon returns to show unmuted state
    - expect: The normal speaker icon appearance is restored
  5. Verify the sound has been toggled back to enabled state
    - expect: The sound is re-enabled
    - expect: Audio output is available for the next spin

#### 1.3. Verify info, help, and settings control functionality

**File:** `tests/slot-machine/info-help-controls.spec.ts`

**Steps:**
  1. Locate the Info Icon button on the left side of the game
    - expect: Info Icon is clearly visible on the top left of the control panel
    - expect: The icon appears clickable
  2. Click on the Info Icon
    - expect: A popup, tooltip, or information panel appears
    - expect: The panel displays relevant game information
  3. Close the information display
    - expect: The information display closes or disappears
    - expect: Game controls return to normal state
  4. Locate the Help Icon button
    - expect: Help Icon is clearly visible below the Info Icon on the left side
    - expect: The icon appears clickable
  5. Click on the Help Icon
    - expect: A help dialog or panel opens
    - expect: The dialog displays game help information, rules, or paylines
    - expect: The dialog is readable and accessible
  6. Close the help dialog
    - expect: The help dialog closes successfully
    - expect: Game controls are fully accessible again
  7. Locate the Settings button
    - expect: Settings button (gear icon) is clearly visible on the left side of the control panel
    - expect: The button appears interactive and clickable
  8. Click on the Settings button to open the settings menu
    - expect: A settings menu or panel opens
    - expect: Settings options are displayed (e.g., audio settings, game speed, graphics quality, etc.)
    - expect: User can interact with the settings
  9. Close the settings menu
    - expect: The settings menu closes and game returns to normal state
    - expect: All controls remain functional

### 2. Bet Amount Management

**Seed:** `tests/seed.spec.ts`

#### 2.1. Verify bet amount display and initial value

**File:** `tests/slot-machine/bet-display.spec.ts`

**Steps:**
  1. Observe and verify the current bet amount
    - expect: The Total bet display shows '0.10 FUN'
    - expect: The bet amount is displayed in the center bottom area of the game interface
    - expect: The display is clear and easily readable
  2. Verify the minimum bet requirement from game information
    - expect: The minimum bet requirement is confirmed as 0.1 FUN (or $0.1)
    - expect: This can be verified from game specifications
  3. Verify the maximum bet requirement from game information
    - expect: The maximum bet requirement is confirmed as 80 FUN (or $80)
    - expect: This can be verified from game specifications

#### 2.2. Verify bet increase functionality using up arrow button

**File:** `tests/slot-machine/bet-increase.spec.ts`

**Steps:**
  1. Locate the bet increase button (up arrow) adjacent to the Total bet display
    - expect: The bet increase button (up arrow ▲) is clearly visible
    - expect: The button is positioned above the Total bet amount in the center bottom area
  2. Verify the increase button is accessible
    - expect: The bet increase button is clickable and interactive
  3. Click the bet increase button once
    - expect: The bet amount increases immediately
    - expect: The new bet value is displayed in the Total bet field
  4. Record and verify the new bet amount
    - expect: The bet increases by a standard increment (e.g., 0.05 FUN, 0.10 FUN, or similar)
    - expect: The new amount is greater than the previous amount
  5. Click the bet increase button multiple times to verify progressive increase
    - expect: Each click increases the bet amount progressively
    - expect: The bet amount continues to increase with each click until reaching the maximum (80 FUN)
  6. Verify the bet stops at the maximum allowed amount
    - expect: The bet stops increasing at the maximum value (80 FUN)
    - expect: No further increase occurs when maximum is reached

#### 2.3. Verify bet decrease functionality using down arrow button

**File:** `tests/slot-machine/bet-decrease.spec.ts`

**Steps:**
  1. Locate the bet decrease button (down arrow) adjacent to the Total bet display
    - expect: The bet decrease button (down arrow ▼) is clearly visible
    - expect: The button is positioned below the Total bet amount in the center bottom area
  2. Verify the decrease button is accessible
    - expect: The bet decrease button is clickable and interactive
  3. Click the bet decrease button once
    - expect: The bet amount decreases immediately
    - expect: The new bet value is displayed in the Total bet field
  4. Record and verify the new bet amount
    - expect: The bet decreases by a standard decrement
    - expect: The new amount is less than the previous amount
  5. Click the bet decrease button multiple times
    - expect: Each click decreases the bet amount progressively
    - expect: The bet amount continues to decrease with each click
  6. Verify the bet stops at the minimum allowed amount (0.1 FUN)
    - expect: The bet stops decreasing at the minimum value (0.1 FUN)
    - expect: No further decrease occurs when minimum is reached

### 3. Basic Gameplay and Balance Validation

**Seed:** `tests/seed.spec.ts`

#### 3.1. Execute a single spin and validate balance change

**File:** `tests/slot-machine/single-spin.spec.ts`

**Steps:**
  1. Note the balance displayed in the bottom left before initiating a spin
    - expect: Current balance is clearly recorded as 1,000.00 FUN
  2. Note the bet amount displayed in the center bottom before spinning
    - expect: Current bet is recorded (default is 0.10 FUN)
  3. Locate the main Spin button in the game interface
    - expect: The Spin button is clearly visible and interactive
    - expect: The button is ready to be clicked to initiate gameplay
  4. Click the Spin button to initiate a spin
    - expect: The reels begin to spin immediately after clicking
    - expect: A spinning animation is displayed on all three reels
    - expect: Spinning sound effects play (if sound is enabled)
  5. Wait for the reels to complete their spin cycle and stop
    - expect: The reels automatically stop spinning after a few seconds
    - expect: The final symbol combination is displayed on the reels
    - expect: The spin animation ends smoothly with a stop animation
  6. Verify the balance has been updated correctly after the spin
    - expect: The balance is updated immediately after the spin completes
    - expect: If no winning combination: balance is reduced by the bet amount (1,000.00 - 0.10 = 999.90 FUN)
    - expect: If a winning combination: balance shows the bet amount plus any winnings
    - expect: The balance update is displayed immediately in the bottom left

#### 3.2. Execute multiple consecutive spins and validate cumulative balance

**File:** `tests/slot-machine/multiple-spins.spec.ts`

**Steps:**
  1. Record the starting balance before executing multiple spins
    - expect: Initial balance is clearly recorded (e.g., 1,000.00 FUN)
  2. Verify the bet amount is consistent across all spins
    - expect: Bet amount is set to a consistent value (e.g., 0.10 FUN)
  3. Execute the first spin
    - expect: Spin completes and balance updates after the first spin
  4. Execute the second spin
    - expect: Spin completes and balance updates further after the second spin
  5. Execute the third spin
    - expect: Spin completes and balance updates again after the third spin
  6. Calculate the expected cumulative balance after 3 spins based on bets and any wins
    - expect: Expected final balance = Initial balance - (bet amount × number of spins) + any winnings accumulated
    - expect: For example: 1,000.00 - (0.10 × 3) = 999.70 FUN (if no wins)
    - expect: Or higher if winning combinations occurred
  7. Verify the actual balance matches the expected calculation
    - expect: The displayed balance matches the calculated expected value
    - expect: All spin transactions are accounted for in the balance
    - expect: No balance discrepancies or errors are observed

#### 3.3. Validate winning combination behavior and payout

**File:** `tests/slot-machine/winning-combination.spec.ts`

**Steps:**
  1. Note the current balance
    - expect: Balance is clearly recorded before attempting to get a winning combination
  2. Execute spins repeatedly until a winning combination appears
    - expect: A winning combination appears on the reels (e.g., three matching symbols in a payline)
    - expect: A visual win animation or highlight is displayed on the winning symbols
  3. Verify the winning payout calculation appears on screen
    - expect: A win payout is calculated and applied immediately
    - expect: The winning amount is displayed (based on symbol values and bet multiplier)
    - expect: The winning payout reflects the bet amount and symbol combination value
  4. Verify the new balance reflects the winning payout correctly
    - expect: The balance increases by the winning amount
    - expect: New balance = Previous balance - bet + winning payout
    - expect: For example: if previous balance was 999.90, bet was 0.10, and win was 1.00, new balance = 999.90 - 0.10 + 1.00 = 1,800 FUN
    - expect: The balance update is displayed immediately in the bottom left

### 4. Autoplay and Bonus Features

**Seed:** `tests/seed.spec.ts`

#### 4.1. Verify autoplay button activation and automatic spin execution

**File:** `tests/slot-machine/autoplay-button.spec.ts`

**Steps:**
  1. Locate the Autoplay button at the bottom right of the game interface
    - expect: The Autoplay button (circular icon with 'A') is clearly visible at the bottom right of the control area
    - expect: The button appears interactive and clickable
  2. Verify the Autoplay button is functional
    - expect: The Autoplay button is clickable and ready for interaction
  3. Click on the Autoplay button to activate automatic spinning mode
    - expect: The Autoplay mode is activated
    - expect: The button appearance changes to show an active/pressed state
    - expect: Automatic spins begin to execute consecutively without manual clicks
  4. Observe the automatic spins executing in sequence
    - expect: Multiple spins execute in sequence automatically
    - expect: Each spin completes before the next one begins
    - expect: The balance decreases with each spin bet (or increases with wins)
    - expect: No manual intervention is required between spins
  5. Locate the control to stop autoplay (may be the same button or a separate stop option)
    - expect: A stop control or button is visible to halt the automatic spins
  6. Click on the Autoplay button again (or stop control) to deactivate autoplay
    - expect: Autoplay mode stops after the current spin completes
    - expect: Automatic spinning ceases
    - expect: Manual control of the Spin button returns

#### 4.2. Verify bonus button functionality and bonus feature access

**File:** `tests/slot-machine/bonus-button.spec.ts`

**Steps:**
  1. Locate the Buy Bonus button on the right side of the machine
    - expect: The Buy Bonus button (gold/yellow colored) is clearly visible on the right side of the slot machine
    - expect: The button displays the current bonus amount (e.g., '6.00 FUN' or similar)
    - expect: The button appears interactive and clickable
  2. Note the current bonus amount shown on the button
    - expect: The bonus amount displayed on the button is accurate
    - expect: The bonus balance may be different from the total account balance
  3. Click on the Buy Bonus button to activate the bonus feature
    - expect: When the bonus button is clicked, a bonus feature is triggered
    - expect: A dialog, popup, or bonus game mode may appear
    - expect: Or the bonus amount may be automatically applied to the next spin
  4. Verify the bonus feature is activated and working
    - expect: The bonus activation provides clear feedback
    - expect: The bonus may trigger free spins, symbol multipliers, or other bonuses
    - expect: Balance updates reflect the bonus application
    - expect: Game continues with bonus features active

### 5. Edge Cases and Error Handling

**Seed:** `tests/seed.spec.ts`

#### 5.1. Verify behavior when balance approaches or becomes insufficient for bet

**File:** `tests/slot-machine/insufficient-balance.spec.ts`

**Steps:**
  1. Execute multiple spins to reduce the balance towards the minimum bet amount
    - expect: Multiple spins execute successfully
    - expect: Balance decreases with each spin (showing 999.90, 999.80, 999.70, etc.)
  2. Continue spinning until balance is very low (close to or below the current bet)
    - expect: Balance continues to decrease
    - expect: Eventually the balance falls to or below the current bet amount
  3. Verify game behavior when balance is insufficient for the next bet
    - expect: The Spin button becomes disabled or inactive
    - expect: An error or warning message appears indicating insufficient balance
    - expect: The game prevents placing a bet that exceeds the available balance
    - expect: User receives clear feedback about the insuffient funds
  4. Verify the game state is stable with depleted or insufficient balance
    - expect: The balance displays the remaining amount or zero
    - expect: The game state is stable and no crashes occur
    - expect: All UI elements remain visible and accessible

#### 5.2. Verify game responsiveness during rapid button interactions

**File:** `tests/slot-machine/rapid-interactions.spec.ts`

**Steps:**
  1. Prepare to rapidly click the bet increase button
    - expect: The bet increase button (up arrow) is ready for rapid clicking
  2. Rapidly click the bet increase button multiple times in quick succession
    - expect: Each click registers and increases the bet amount
    - expect: Bet increases progressively with each rapid click
    - expect: The display updates in real-time
  3. Rapidly click the bet decrease button multiple times in quick succession
    - expect: Each click registers and decreases the bet amount
    - expect: Bet decreases progressively with each rapid click
  4. Click the Spin button while a previous spin is still executing
    - expect: The first spin starts executing
    - expect: A second click on the Spin button while the first spin is running is ignored or queued
    - expect: No overlapping or conflicting spins occur
    - expect: The game prevents invalid states
  5. Verify game state remains consistent and accurate after rapid interactions
    - expect: All balance calculations are accurate after rapid interactions
    - expect: No data corruption or inconsistencies are observed
    - expect: The game state remains valid and consistent

#### 5.3. Verify game state reset after page refresh and navigation

**File:** `tests/slot-machine/page-refresh.spec.ts`

**Steps:**
  1. Play several spins and note the final balance (different from initial 1,000.00 FUN)
    - expect: Multiple spins complete successfully
    - expect: Balance is recorded (e.g., 999.50 FUN after several spins)
  2. Refresh the page using F5 or Ctrl+R
    - expect: The page reloads successfully
    - expect: The Casino.Guru website remains accessible
  3. Wait for the page and game to fully reload
    - expect: The game page loads successfully
    - expect: The Slot Machine game interface appears fully loaded
  4. Navigate back to or observe the Slot Machine game after refresh
    - expect: Balance is reset to initial 1,000.00 FUN (demo mode resets on page refresh)
    - expect: Bet is reset to default 0.10 FUN
    - expect: No previous session data is retained in demo mode
  5. Verify game initialization with fresh demo balance after page refresh
    - expect: Balance shows 1,000.00 FUN
    - expect: Bet shows 0.10 FUN
    - expect: Game is ready for fresh gameplay
    - expect: No carryover from previous session is visible
