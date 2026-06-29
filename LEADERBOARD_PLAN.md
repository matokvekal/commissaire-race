# Leaderboard Page - Implementation Plan

## 📋 Overview

Create a public-facing leaderboard page for standard users (spectators, riders, families) with advanced filtering, searching, and sorting capabilities. Optimized for both mobile devices and large display screens.

**Target Audience**:

- 🏆 Race spectators (families, friends)
- 🚴 Riders checking their position
- 📺 Big screen displays at race venue
- 📱 Mobile users following remotely

---

## 🎯 Core Features

### **1. Multi-Level Filtering**

Users can filter results by:

- **All Waves** - Show all riders from all waves
- **Specific Wave** - Filter by wave number (Wave 1, Wave 2, etc.)
- **Specific Start Group** - Filter by start time group
- **All Categories** - Show all categories together
- **Specific Category** - Filter by single category (Elite Men, U19, etc.)
- **Mixed Categories** - Select multiple categories at once
- **Mixed Starts** - Combine multiple start groups
- **Time Filter** - Show results as of specific time
- **Status Filter** - Racing, Finished, DNS, DNF, DSQ

### **2. Advanced Search**

- **Search by Name** - First name, last name, or full name
- **Search by Bib Number** - Exact or partial match
- **Search by Team** - Find all riders from a team
- **Real-time Search** - Results update as you type
- **Highlight Results** - Matched riders highlighted

### **3. Flexible Sorting**

Primary and secondary sort options:

- **Sort by Position** (ascending/descending)
- **Sort by Name** (A-Z or Z-A)
- **Sort by Bib Number**
- **Sort by Category** → then by position within category
- **Sort by Team** → then by position
- **Sort by Laps Completed**
- **Sort by Time/Gap** (behind leader)
- **Sort by Status** → then by position

### **4. Display Modes**

- **Compact Mode** - Mobile-friendly, essential info only
- **Detailed Mode** - Full information with all columns
- **Big Screen Mode** - Large text, high contrast, auto-scroll
- **Grid View** - Card-based layout
- **Table View** - Traditional results table

### **5. Real-Time Updates**

- **Live Position Updates** - Auto-refresh every X seconds
- **Lap Progress** - Show current lap number
- **Gap to Leader** - Time difference from 1st place
- **Position Changes** - Visual indicators (↑↓) for position changes
- **New Finishers** - Highlight riders who just finished

---

## 🎨 UI/UX Design

### **Mobile View (320px - 768px)**

```
┌─────────────────────────────────────────────┐
│ 🏁 Live Results                    [Filter] │
├─────────────────────────────────────────────┤
│                                             │
│ 🔍 Search: [Find rider or bib...     ] 🔎  │
│                                             │
│ [All Categories ▼] [Sort: Position ▼]      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🥇 1st │ #42 │ John Smith          │   │
│ │ Elite Men │ 5/5 laps │ 1:23:45    │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🥈 2nd │ #17 │ Mike Johnson    ↑   │   │
│ │ Elite Men │ 5/5 laps │ +0:02:15   │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🥉 3rd │ #8 │ David Lee            │   │
│ │ Elite Men │ 5/5 laps │ +0:03:45   │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Show More...]                              │
│                                             │
└─────────────────────────────────────────────┘
```

### **Desktop/Tablet View (768px+)**

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🏁 Mountain Bike Championship 2026 - Live Results      [Big Screen 📺] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Filters:                                                               │
│ Wave: [All ▼]  Category: [All ▼]  Status: [All ▼]  [Advanced Filters]│
│                                                                        │
│ 🔍 Search: [____________________________________________] 🔎 [Clear]    │
│                                                                        │
│ Sort: [Position ▼]  Then by: [Category ▼]      View: [●Table ○Grid]  │
│                                                                        │
│ ┌──────┬─────┬───────────────┬──────────┬──────┬────────┬─────────┐  │
│ │ Pos  │ Bib │ Name          │ Category │ Team │ Laps   │ Time    │  │
│ ├──────┼─────┼───────────────┼──────────┼──────┼────────┼─────────┤  │
│ │ 🥇 1 │ 42  │ John Smith    │ Elite M  │ ABCD │ 5/5    │1:23:45  │  │
│ │ 🥈 2 │ 17  │ Mike Johnson↑ │ Elite M  │ EFGH │ 5/5    │+0:02:15 │  │
│ │ 🥉 3 │ 8   │ David Lee     │ Elite M  │ ABCD │ 5/5    │+0:03:45 │  │
│ │   4  │ 23  │ Tom Brown     │ Elite M  │ IJKL │ 5/5    │+0:05:12 │  │
│ │   5  │ 91  │ Jake Wilson   │ Elite M  │ EFGH │ 4/5 🔄 │-1 lap   │  │
│ │ ...  │ ... │ ...           │ ...      │ ...  │ ...    │ ...     │  │
│ └──────┴─────┴───────────────┴──────────┴──────┴────────┴─────────┘  │
│                                                                        │
│ Showing 1-50 of 234 riders          [< Prev] Page 1 of 5 [Next >]    │
│                                                                        │
│ Last updated: 14:35:23 • Auto-refresh: ON [⚙️Settings]               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### **Big Screen Mode (TV/Projector Display)**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│              🏁 LIVE RACE RESULTS 🏁                          │
│           Mountain Bike Championship 2026                      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  POS    BIB    NAME                CATEGORY      TIME          │
│                                                                │
│  🥇 1    42    JOHN SMITH          ELITE MEN     1:23:45      │
│                                                                │
│  🥈 2    17    MIKE JOHNSON ↑      ELITE MEN     +0:02:15     │
│                                                                │
│  🥉 3     8    DAVID LEE           ELITE MEN     +0:03:45     │
│                                                                │
│   4      23    TOM BROWN           ELITE MEN     +0:05:12     │
│                                                                │
│   5      91    JAKE WILSON         ELITE MEN     -1 LAP       │
│                                                                │
│   6      14    PAUL GARCIA         ELITE MEN     -1 LAP       │
│                                                                │
│   7      55    MARK DAVIS          ELITE MEN     -1 LAP       │
│                                                                │
│   8      33    CHRIS MOORE         ELITE MEN     -2 LAPS      │
│                                                                │
│                                                                │
│              ELITE MEN - WAVE 1 - LAP 5/5                     │
│            Last Updated: 14:35:23 • AUTO-SCROLL               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **Filter Panel (Advanced)**

```
┌─────────────────────────────────────────────┐
│ 🔧 Advanced Filters                    [✕] │
├─────────────────────────────────────────────┤
│                                             │
│ Wave Selection:                             │
│ ☑ Wave 1 (07:30)    ☑ Wave 2 (08:00)      │
│ ☐ Wave 3 (08:30)    ☐ Wave 4 (09:00)      │
│                                             │
│ Category Selection:                         │
│ ☑ Elite Men         ☐ Elite Women          │
│ ☑ U19 Men          ☑ U19 Women            │
│ ☐ Masters 40+      ☐ Masters 50+          │
│                                             │
│ Status:                                     │
│ ☑ Racing    ☑ Finished    ☐ DNS           │
│ ☐ DNF       ☐ DSQ                          │
│                                             │
│ Team Filter:                                │
│ [Select team(s)...                    ▼]   │
│                                             │
│ Position Range:                             │
│ From: [1   ] To: [50  ]                    │
│                                             │
│ Lap Filter:                                 │
│ ○ All laps                                  │
│ ○ Completed race only                      │
│ ○ On lead lap only                         │
│ ○ Custom: [___] laps completed             │
│                                             │
│ [Reset All]        [Cancel]  [Apply]       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
src/
├── app/
│   └── leaderboard/
│       ├── page.tsx                    # Main leaderboard page
│       ├── leaderboard.module.css      # Styles
│       ├── bigscreen/
│       │   └── page.tsx                # Big screen display mode
│       └── components/
│           ├── LeaderboardTable.tsx    # Table view component
│           ├── LeaderboardGrid.tsx     # Grid/card view
│           ├── FilterPanel.tsx         # Advanced filter UI
│           ├── SearchBar.tsx           # Search input
│           ├── SortControls.tsx        # Sort dropdowns
│           ├── RiderCard.tsx           # Individual rider card
│           ├── PositionBadge.tsx       # Medal/position indicator
│           ├── ViewModeToggle.tsx      # Switch views
│           └── BigScreenScroller.tsx   # Auto-scroll for big screen
├── hooks/
│   ├── useLeaderboard.ts               # Leaderboard data logic
│   ├── useLeaderboardFilters.ts        # Filter state management
│   ├── useLeaderboardSort.ts           # Sort logic
│   └── useLeaderboardSearch.ts         # Search logic
├── utils/
│   ├── leaderboardFilters.ts           # Filter functions
│   ├── leaderboardSort.ts              # Sort algorithms
│   ├── formatLeaderboardData.ts        # Data formatting
│   └── calculateGap.ts                 # Gap calculation (time behind leader)
└── types/
    └── leaderboard.types.ts            # TypeScript types
```

---

## 📝 Implementation Steps

### **Phase 1: Core Leaderboard (Week 1)**

#### Step 1.1: Type Definitions

- [ ] Create `types/leaderboard.types.ts`

  ```typescript
  export interface LeaderboardRider {
    id: string;
    position: number;
    previousPosition?: number;
    bibNumber: number;
    firstName: string;
    lastName: string;
    fullName: string;
    category: string;
    team?: string;
    wave: number;
    startGroup: string;
    lapsCompleted: number;
    totalLaps: number;
    totalTime?: number; // milliseconds
    gap?: string; // "+0:02:15" or "-1 lap"
    status: "racing" | "finished" | "dns" | "dnf" | "dsq";
    lastUpdateTime: Date;
  }

  export interface LeaderboardFilters {
    waves: number[];
    categories: string[];
    startGroups: string[];
    status: string[];
    teams: string[];
    positionRange: { min: number; max: number };
    lapFilter: "all" | "completed" | "lead-lap" | "custom";
    customLaps?: number;
  }

  export interface LeaderboardSort {
    primary:
      | "position"
      | "name"
      | "bib"
      | "category"
      | "team"
      | "laps"
      | "time";
    secondary?: "position" | "name" | "bib" | "category";
    order: "asc" | "desc";
  }

  export type DisplayMode = "compact" | "detailed" | "grid" | "bigscreen";
  ```

#### Step 1.2: Data Fetching Hook

- [ ] Create `hooks/useLeaderboard.ts`
  - Fetch rider data from stores
  - Calculate positions
  - Calculate gaps (time behind leader)
  - Handle real-time updates
  - Cache results for performance

#### Step 1.3: Basic Table Component

- [ ] Create `LeaderboardTable.tsx`
  - Display rider positions
  - Show essential columns (pos, bib, name, category, time)
  - Responsive design
  - Mobile-optimized

---

### **Phase 2: Filtering System (Week 1-2)**

#### Step 2.1: Filter State Management

- [ ] Create `hooks/useLeaderboardFilters.ts`

  ```typescript
  export const useLeaderboardFilters = () => {
    const [activeFilters, setActiveFilters] = useState<LeaderboardFilters>({
      waves: [],
      categories: [],
      startGroups: [],
      status: ["racing", "finished"],
      teams: [],
      positionRange: { min: 1, max: 999 },
      lapFilter: "all"
    });

    const applyFilters = (riders: LeaderboardRider[]) => {
      return riders.filter((rider) => {
        // Wave filter
        if (
          activeFilters.waves.length > 0 &&
          !activeFilters.waves.includes(rider.wave)
        ) {
          return false;
        }
        // Category filter
        if (
          activeFilters.categories.length > 0 &&
          !activeFilters.categories.includes(rider.category)
        ) {
          return false;
        }
        // Status filter
        if (!activeFilters.status.includes(rider.status)) {
          return false;
        }
        // ... more filters
        return true;
      });
    };

    return { activeFilters, setActiveFilters, applyFilters };
  };
  ```

#### Step 2.2: Filter UI Components

- [ ] Create `FilterPanel.tsx`
  - Wave checkboxes (multi-select)
  - Category checkboxes (multi-select)
  - Status radio buttons
  - Team dropdown (multi-select)
  - Position range slider
  - Lap filter options
  - "Reset All" button
  - "Apply" button

#### Step 2.3: Quick Filter Buttons

- [ ] Add quick filter shortcuts
  - "All Waves"
  - "Elite Only"
  - "My Category"
  - "Top 10"
  - "Finished Only"

---

### **Phase 3: Search Functionality (Week 2)**

#### Step 3.1: Search Hook

- [ ] Create `hooks/useLeaderboardSearch.ts`

  ```typescript
  export const useLeaderboardSearch = (riders: LeaderboardRider[]) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<LeaderboardRider[]>([]);

    const search = useCallback(
      (term: string) => {
        if (!term.trim()) {
          setSearchResults(riders);
          return;
        }

        const lowercaseTerm = term.toLowerCase();
        const results = riders.filter((rider) => {
          // Search by name
          if (rider.fullName.toLowerCase().includes(lowercaseTerm)) return true;
          // Search by bib number
          if (rider.bibNumber.toString().includes(term)) return true;
          // Search by team
          if (rider.team?.toLowerCase().includes(lowercaseTerm)) return true;
          return false;
        });

        setSearchResults(results);
      },
      [riders]
    );

    return { searchTerm, setSearchTerm, searchResults, search };
  };
  ```

#### Step 3.2: Search UI

- [ ] Create `SearchBar.tsx`
  - Search input with icon
  - Real-time search (debounced)
  - Clear button
  - Search suggestions (autocomplete)
  - Highlight matched text in results

---

### **Phase 4: Sorting System (Week 2)**

#### Step 4.1: Sort Logic

- [ ] Create `utils/leaderboardSort.ts`

  ```typescript
  export const sortRiders = (
    riders: LeaderboardRider[],
    sortConfig: LeaderboardSort
  ): LeaderboardRider[] => {
    return [...riders].sort((a, b) => {
      // Primary sort
      let comparison = 0;

      switch (sortConfig.primary) {
        case "position":
          comparison = a.position - b.position;
          break;
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "bib":
          comparison = a.bibNumber - b.bibNumber;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          // Secondary sort by position within category
          if (comparison === 0 && sortConfig.secondary === "position") {
            comparison = a.position - b.position;
          }
          break;
        case "team":
          const teamA = a.team || "";
          const teamB = b.team || "";
          comparison = teamA.localeCompare(teamB);
          break;
        case "laps":
          comparison = b.lapsCompleted - a.lapsCompleted; // More laps first
          break;
        case "time":
          comparison = (a.totalTime || 0) - (b.totalTime || 0);
          break;
      }

      // Apply sort order
      return sortConfig.order === "asc" ? comparison : -comparison;
    });
  };
  ```

#### Step 4.2: Sort UI

- [ ] Create `SortControls.tsx`
  - Primary sort dropdown
  - Secondary sort dropdown (conditional)
  - Sort order toggle (↑↓)
  - "Sort by Category → Position" preset
  - "Sort by Team → Position" preset

---

### **Phase 5: Display Modes (Week 3)**

#### Step 5.1: Grid View

- [ ] Create `LeaderboardGrid.tsx`
  - Card-based layout
  - 2-3 cards per row (responsive)
  - Large rider photo (optional)
  - Key stats in card
  - Position badge

#### Step 5.2: Compact Mode

- [ ] Optimize for mobile
  - Minimal columns (pos, bib, name, time)
  - Expandable rows for details
  - Swipe gestures for actions
  - Sticky header

#### Step 5.3: Big Screen Mode

- [ ] Create `bigscreen/page.tsx`
  - Large font sizes (readable from distance)
  - High contrast colors
  - Auto-scroll functionality
  - Full-screen mode
  - No interactive elements
  - Auto-refresh every 30 seconds
  - Cycle through categories

#### Step 5.4: View Mode Toggle

- [ ] Create `ViewModeToggle.tsx`
  - Switch between table/grid/compact
  - Save preference in localStorage
  - Icons for each mode

---

### **Phase 6: Real-Time Updates (Week 3)**

#### Step 6.1: Auto-Refresh Logic

- [ ] Implement polling or WebSocket updates
  - Fetch updated positions every 30 seconds
  - Compare with previous data
  - Highlight position changes (↑↓)
  - Animate new finishers

#### Step 6.2: Position Change Indicators

- [ ] Visual indicators for changes
  - Green ↑ for position gained
  - Red ↓ for position lost
  - Fade after 10 seconds
  - Animate transitions

#### Step 6.3: Live Status Badges

- [ ] Status indicators
  - 🔵 Racing (blue pulsing dot)
  - 🏁 Finished (checkered flag)
  - ⏸️ DNS (gray)
  - 🚫 DNF/DSQ (red)

---

### **Phase 7: Gap Calculations (Week 3)**

#### Step 7.1: Time Gap Calculation

- [ ] Create `utils/calculateGap.ts`

  ```typescript
  export const calculateGap = (
    rider: LeaderboardRider,
    leader: LeaderboardRider
  ): string => {
    // If same laps
    if (rider.lapsCompleted === leader.lapsCompleted) {
      if (!rider.totalTime || !leader.totalTime) return "-";
      const gapMs = rider.totalTime - leader.totalTime;
      return formatTimeGap(gapMs); // e.g., "+0:02:15"
    }

    // If lapped
    const lapsDiff = rider.lapsCompleted - leader.lapsCompleted;
    return `${lapsDiff} lap${Math.abs(lapsDiff) > 1 ? "s" : ""}`;
  };

  export const formatTimeGap = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `+${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `+${minutes}:${pad(seconds)}`;
  };
  ```

#### Step 7.2: Gap Display

- [ ] Show gaps in leaderboard
  - Leader shows actual time (1:23:45)
  - Others show gap (+0:02:15)
  - Lapped riders show "-1 lap"
  - Color-code gaps (green < 10s, yellow < 1min, red > 1min)

---

### **Phase 8: Big Screen Features (Week 4)**

#### Step 8.1: Auto-Scroll

- [ ] Create `BigScreenScroller.tsx`
  - Smooth auto-scroll through results
  - Configurable speed
  - Pause on hover (if interactive)
  - Loop back to top
  - Show current section indicator

#### Step 8.2: Category Rotation

- [ ] Cycle through categories
  - Show Elite Men for 30 seconds
  - Transition to U19 Men
  - Show all categories in sequence
  - Configurable display time per category

#### Step 8.3: Fullscreen API

- [ ] Implement fullscreen mode
  - Button to enter fullscreen
  - Hide browser UI
  - Show race logo/branding
  - Display race name and time

---

### **Phase 9: Polish & Optimization (Week 4)**

#### Step 9.1: Performance

- [ ] Optimize for large datasets
  - Virtual scrolling (react-window)
  - Memoize sort/filter functions
  - Lazy load images
  - Debounce search
  - Cache filtered results

#### Step 9.2: Accessibility

- [ ] Ensure accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus management
  - Contrast ratios (WCAG AA)

#### Step 9.3: Responsive Design

- [ ] Test all breakpoints
  - Mobile (320px - 767px)
  - Tablet (768px - 1023px)
  - Desktop (1024px+)
  - Large screens (1920px+)
  - Portrait and landscape

#### Step 9.4: Loading States

- [ ] Add loading indicators
  - Skeleton loaders
  - Spinner for data fetch
  - "Updating..." indicator
  - Error states with retry

---

## 🎨 Color Scheme & Visual Design

### **Position Indicators**

- 🥇 **1st Place**: Gold (#FFD700)
- 🥈 **2nd Place**: Silver (#C0C0C0)
- 🥉 **3rd Place**: Bronze (#CD7F32)
- **Top 10**: Blue accent (#3B82F6)
- **Top 25**: Gray (#6B7280)
- **Others**: Default text color

### **Status Colors**

- **Racing**: Blue (#3B82F6) with pulse animation
- **Finished**: Green (#10B981)
- **DNS**: Gray (#9CA3AF)
- **DNF**: Orange (#F59E0B)
- **DSQ**: Red (#EF4444)

### **Gap Colors** (Time Behind Leader)

- **0-10 seconds**: Light green (#D1FAE5)
- **10-60 seconds**: Light yellow (#FEF3C7)
- **1-5 minutes**: Light orange (#FFEDD5)
- **5+ minutes**: Light red (#FEE2E2)
- **Lapped**: Light gray (#F3F4F6)

---

## 📊 Example Sort & Filter Combinations

### **Use Case 1: "Show me Elite Men from Wave 1"**

```typescript
filters = {
  waves: [1],
  categories: ["Elite Men"],
  status: ["racing", "finished"]
};
sort = {
  primary: "position",
  order: "asc"
};
```

### **Use Case 2: "Find all riders from Team ABC"**

```typescript
search = "Team ABC";
// OR
filters = {
  teams: ["Team ABC"]
};
sort = {
  primary: "position",
  order: "asc"
};
```

### **Use Case 3: "Show all categories, sorted by category then position"**

```typescript
filters = {
  categories: [], // All
  status: ["racing", "finished"]
};
sort = {
  primary: "category",
  secondary: "position",
  order: "asc"
};
```

### **Use Case 4: "Top 10 overall, any category"**

```typescript
filters = {
  positionRange: { min: 1, max: 10 },
  status: ["finished"]
};
sort = {
  primary: "position",
  order: "asc"
};
```

### **Use Case 5: "Riders who finished the race"**

```typescript
filters = {
  status: ["finished"],
  lapFilter: "completed" // Completed all laps
};
sort = {
  primary: "position",
  order: "asc"
};
```

### **Use Case 6: "My bib number 42"**

```typescript
search = "42";
// System highlights rider #42 in results
```

---

## 🔧 Advanced Features (Optional)

### **Feature 1: Share Results**

- Copy link to filtered view
- Share specific rider position
- QR code for mobile access
- Export to PDF

### **Feature 2: Rider Comparison**

- Select 2-4 riders
- Side-by-side comparison
- Gap analysis
- Lap-by-lap breakdown

### **Feature 3: Historical Positions**

- Show position history over time
- Line graph of position changes
- Fastest lap indicator
- Lap times table

### **Feature 4: Notifications**

- Follow specific riders
- Get notifications when they finish
- Position change alerts
- Web Push notifications

### **Feature 5: Print Mode**

- Print-optimized layout
- PDF generation
- Official results format
- Include race logo and details

---

## 🚀 Implementation Timeline

### **Week 1: Core Foundation**

- Day 1-2: Type definitions, data fetching hook
- Day 3-4: Basic table component, mobile responsive
- Day 5: Filter state management

### **Week 2: Filtering & Search**

- Day 1-2: Filter panel UI, filter logic
- Day 3: Search functionality
- Day 4-5: Sort system (multi-level)

### **Week 3: Display Modes**

- Day 1-2: Grid view, compact mode
- Day 3: Big screen mode
- Day 4-5: Real-time updates, position changes

### **Week 4: Polish & Big Screen**

- Day 1-2: Gap calculations, auto-scroll
- Day 3: Category rotation, fullscreen
- Day 4-5: Performance optimization, testing

**Total Time: 4 weeks** (full-time development)

---

## ✅ Success Criteria

- [ ] Leaderboard loads in < 2 seconds for 500 riders
- [ ] Filters update results in < 200ms
- [ ] Search returns results instantly (< 100ms)
- [ ] Works smoothly on mobile devices
- [ ] Big screen mode readable from 10 meters away
- [ ] Auto-refresh updates without flicker
- [ ] Handles 1000+ riders without performance issues
- [ ] All combinations of filters work correctly
- [ ] Sort by category + position works perfectly
- [ ] Gap calculations are accurate
- [ ] Position changes animate smoothly
- [ ] Accessible (WCAG AA compliant)

---

## 🎯 Key User Flows

### **Flow 1: Spectator Finding Their Family Member**

1. Open leaderboard page
2. Type family member's name in search
3. See highlighted result with current position
4. View gap to leader and lap progress

### **Flow 2: Race Organizer on Big Screen**

1. Open leaderboard
2. Click "Big Screen Mode"
3. Select "Elite Men" category
4. Enable auto-scroll
5. Results display on projector, update every 30s

### **Flow 3: Rider Checking Their Category Results**

1. Open leaderboard
2. Filter by their category (e.g., "U19 Men")
3. Sort by position
4. Find their bib number in list
5. See position and gap to podium

### **Flow 4: Team Manager Tracking Team Performance**

1. Open leaderboard
2. Search for team name
3. See all team riders
4. Sort by position within team
5. Monitor lap progress

---

## 📱 Mobile-First Design Principles

1. **Touch-Friendly**: Large tap targets (44x44px minimum)
2. **Swipe Gestures**: Swipe to reveal more info
3. **Sticky Header**: Filters stay visible while scrolling
4. **Pull to Refresh**: Intuitive refresh gesture
5. **Offline Support**: Cache last viewed results
6. **Minimal Data**: Optimize images, lazy load
7. **Fast Load**: < 3 seconds on 3G

---

## 🎬 Next Steps

1. **Review this plan** with stakeholders
2. **Design mockups** in Figma (optional)
3. **Start Phase 1** - Build core leaderboard
4. **Test with real data** - Import sample race results
5. **Iterate based on feedback**
6. **Deploy to production**
7. **Test at live race event**

---

**Estimated Total Time: 4 weeks**

**Priority: HIGH** - Core feature for spectators and race display

**User Experience: EXCELLENT** - Intuitive, fast, and feature-rich

---

🏁 **Ready to build the ultimate race leaderboard!** 🚴‍♂️
