# CS2 C4 Timer

A real-time C4 defuse timer overlay for Counter-Strike 2 that provides visual countdown and color-coded warnings during bomb defusal scenarios.

## Features

- **Real-time Timer Display**: Shows the exact time remaining for C4 defusal
- **Color-coded Visual Warnings**:
  - 🟢 **Green** (Safe): Above 10 seconds remaining
  - 🟡 **Yellow** (Warning): 5-10 seconds (defusable with kit)
  - 🔴 **Red** (Danger): Below 5 seconds
- **Transparent Overlay**: Minimal interference with gameplay
- **CS2 Game State Integration**: Direct integration with CS2's GSI system

### Setup

1. **Install the GSI Configuration**:
   - Copy `gamestate_integration_c4timer.cfg` to your CS2 config folder:

   ```plaintext
   C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
   ```

2. **Launch the Application**:
   - Download the .exe executable from the lastest release, and just double click it!
   - Run the timer application
   - The overlay will automatically connect to CS2 when a match starts
   - the program might say that it is unsafe or whatever, but when it pops up, just click "more details" and "run anyway"

   - or you may just build this electron app by forking the repository

## Usage

1. Start CS2 and join a match
2. Launch the de_timer application
3. The timer will automatically appear when the C4 is planted
4. Position the overlay window as desired on your screen *to be developed
