# AI Load Assistant - Frontend Design Specification

## Overview

The AI Load Assistant is a floating chatbot popup component that provides AI-powered load matching assistance. Users can type natural language queries to find loads that match their route and equipment requirements.

**Note:** This document contains frontend design specifications only—dimensions, colors, typography, animations, and interactive behaviors. Implementation details are excluded.

---

## 1. Component Structure

```
AIAssistant (Root)
├── Trigger Button (when closed)
│   └── MessageSquare Icon
│
└── Popup Container (when open)
    └── Card
        ├── CardHeader
        │   ├── Icon Container
        │   │   └── Bot Icon
        │   ├── Title Section
        │   │   ├── CardTitle ("AI Load Assistant")
        │   │   └── Subtitle ("Powered by Claude AI")
        │   └── Close Button
        │       └── X Icon
        │
        ├── CardContent (Messages Area)
        │   ├── Message List
        │   │   ├── Message Item (repeating)
        │   │   │   ├── Avatar (Bot or User)
        │   │   │   │   └── Icon
        │   │   │   └── Message Bubble
        │   │   │       ├── Content Text
        │   │   │       └── Timestamp
        │   │   │
        │   │   └── Loading Indicator (when loading)
        │   │       ├── Bot Avatar
        │   │       └── Typing Dots Container
        │   │           ├── Dot 1
        │   │           ├── Dot 2
        │   │           └── Dot 3
        │   │
        │   └── Scroll Anchor (messagesEndRef)
        │
        └── Input Area
            ├── Input Field
            └── Send Button
                └── Send/Loader2 Icon
```

---

## 2. Dimensions & Layout

| Element                     | Width         | Height     | Padding               | Margin | Gap              | Border Radius         |
| --------------------------- | ------------- | ---------- | --------------------- | ------ | ---------------- | --------------------- |
| **Trigger Button**          | 56px (p-4)    | 56px (p-4) | 16px                  | -      | -                | 9999px (rounded-full) |
| **Popup Container**         | 420px         | 650px      | -                     | -      | -                | varies                |
| **Card**                    | 100%          | 100%       | -                     | -      | -                | default               |
| **CardHeader**              | 100%          | auto       | 20px                  | -      | 12px             | 0                     |
| **Header Icon Container**   | auto          | auto       | 8px                   | -      | -                | 0 (rounded-none)      |
| **Bot Icon (header)**       | 20px (size-5) | 20px       | -                     | -      | -                | -                     |
| **X Icon (close)**          | 20px (size-5) | 20px       | -                     | -      | -                | -                     |
| **CardContent (Messages)**  | 100%          | flex-1     | 24px                  | -      | 16px (space-y-4) | 0                     |
| **Message Avatar**          | 36px (w-9)    | 36px (h-9) | -                     | -      | -                | 0 (rounded-none)      |
| **Avatar Icon**             | 16px (size-4) | 16px       | -                     | -      | -                | -                     |
| **Message Bubble**          | max 75%       | auto       | 16px                  | -      | -                | 16px (rounded-2xl)    |
| **Message Bubble (corner)** | -             | -          | -                     | -      | -                | 2px (rounded-t/r-sm)  |
| **Typing Dot**              | 8px (w-2)     | 8px (h-2)  | -                     | -      | 6px (gap-1.5)    | 9999px (rounded-full) |
| **Input Area Container**    | 100%          | auto       | 16px                  | -      | -                | 0                     |
| **Input Field**             | flex-1        | auto       | 12px 16px (py-3 px-4) | -      | 12px             | 0 (rounded-none)      |
| **Send Button**             | auto          | auto       | 20px (px-5)           | -      | -                | 0 (rounded-none)      |
| **Send Icon**               | 20px (size-5) | 20px       | -                     | -      | -                | -                     |

---

## 3. Typography

| Element               | Font Family | Font Size      | Font Weight     | Line Height             | Color                 |
| --------------------- | ----------- | -------------- | --------------- | ----------------------- | --------------------- |
| **Card Title**        | inherit     | 18px (text-lg) | 700 (font-bold) | normal                  | #FFFFFF (white)       |
| **Subtitle**          | inherit     | 12px (text-xs) | 400             | normal                  | rgba(255,255,255,0.8) |
| **Message Content**   | inherit     | 14px (text-sm) | 400             | 1.625 (leading-relaxed) | varies (see Colors)   |
| **Timestamp**         | inherit     | 12px (text-xs) | 400             | normal                  | varies (see Colors)   |
| **Input Placeholder** | inherit     | 14px (text-sm) | 400             | normal                  | muted (CSS variable)  |

---

## 4. Colors

### Trigger Button (Closed State)

| Property             | Light Mode                                | Dark Mode |
| -------------------- | ----------------------------------------- | --------- |
| Background (default) | linear-gradient(135deg, #F59E0B, #EA580C) | Same      |
| Background (hover)   | linear-gradient(135deg, #D97706, #C2410C) | Same      |
| Text/Icon            | #FFFFFF                                   | #FFFFFF   |
| Shadow               | 0 25px 50px -12px rgba(0,0,0,0.25)        | Same      |
| Shadow (hover)       | 0 25px 50px -12px rgba(245,158,11,0.5)    | Same      |

### Popup Container

| Property        | Light Mode                                | Dark Mode                                 |
| --------------- | ----------------------------------------- | ----------------------------------------- |
| Card Background | linear-gradient(135deg, #FFFFFF, #F9FAFB) | linear-gradient(135deg, #111827, #030712) |
| Card Shadow     | 0 25px 50px -12px rgba(0,0,0,0.25)        | Same                                      |
| Card Border     | transparent                               | transparent                               |

### Header

| Property           | Light Mode                               | Dark Mode |
| ------------------ | ---------------------------------------- | --------- |
| Background         | linear-gradient(90deg, #F59E0B, #EA580C) | Same      |
| Text               | #FFFFFF                                  | #FFFFFF   |
| Icon Container BG  | rgba(255,255,255,0.2)                    | Same      |
| Close Button Hover | rgba(255,255,255,0.2)                    | Same      |
| Shadow             | 0 10px 15px -3px rgba(0,0,0,0.1)         | Same      |

### Messages Area

| Property        | Light Mode                                              | Dark Mode                                 |
| --------------- | ------------------------------------------------------- | ----------------------------------------- |
| Background      | linear-gradient(180deg, rgba(249,250,251,0.5), #FFFFFF) | linear-gradient(180deg, #111827, #030712) |
| Scrollbar Thumb | rgba(245,158,11,0.2)                                    | rgba(245,158,11,0.2)                      |
| Scrollbar Track | transparent                                             | transparent                               |

### Assistant Message Bubble

| Property         | Light Mode                     | Dark Mode         |
| ---------------- | ------------------------------ | ----------------- |
| Background       | #FFFFFF                        | #1F2937           |
| Border           | 1px solid #F3F4F6              | 1px solid #374151 |
| Text             | #111827                        | #F9FAFB           |
| Timestamp        | #6B7280                        | #6B7280           |
| Shadow (default) | 0 1px 2px rgba(0,0,0,0.05)     | Same              |
| Shadow (hover)   | 0 4px 6px -1px rgba(0,0,0,0.1) | Same              |

### User Message Bubble

| Property         | Light Mode                                | Dark Mode             |
| ---------------- | ----------------------------------------- | --------------------- |
| Background       | linear-gradient(135deg, #F59E0B, #EA580C) | Same                  |
| Border           | none                                      | none                  |
| Text             | #FFFFFF                                   | #FFFFFF               |
| Timestamp        | rgba(255,255,255,0.7)                     | rgba(255,255,255,0.7) |
| Shadow (default) | 0 1px 2px rgba(0,0,0,0.05)                | Same                  |
| Shadow (hover)   | 0 4px 6px -1px rgba(0,0,0,0.1)            | Same                  |

### Avatar Icons

| Property       | Light Mode                                | Dark Mode |
| -------------- | ----------------------------------------- | --------- |
| Bot Avatar BG  | linear-gradient(135deg, #F59E0B, #EA580C) | Same      |
| User Avatar BG | linear-gradient(135deg, #4B5563, #374151) | Same      |
| Icon Color     | #FFFFFF                                   | #FFFFFF   |

### Loading Indicator (Typing Dots)

| Property         | Light Mode        | Dark Mode         |
| ---------------- | ----------------- | ----------------- |
| Container BG     | #FFFFFF           | #1F2937           |
| Container Border | 1px solid #F3F4F6 | 1px solid #374151 |
| Dot Color        | #F59E0B           | #F59E0B           |

### Input Area

| Property                   | Light Mode                         | Dark Mode           |
| -------------------------- | ---------------------------------- | ------------------- |
| **Container BG**           | #FFFFFF                            | #111827             |
| **Border Top**             | 1px solid #E5E7EB                  | 1px solid #1F2937   |
| **Shadow**                 | 0 10px 15px -3px rgba(0,0,0,0.1)   | Same                |
| **Input Border (default)** | #E5E7EB                            | #374151             |
| **Input Border (focus)**   | #F59E0B (Amber-500)                | #F59E0B (Amber-500) |
| **Input Ring (focus)**     | #F59E0B, 1px width                 | #F59E0B, 1px width  |
| **Input Ring Offset**      | 0px                                | 0px                 |
| **Input Background**       | #FFFFFF                            | transparent         |
| **Focus Transition**       | 150ms cubic-bezier(0.4, 0, 0.2, 1) | Same                |

### Send Button

| Property           | Light Mode                                | Dark Mode | State    |
| ------------------ | ----------------------------------------- | --------- | -------- |
| Background         | linear-gradient(135deg, #F59E0B, #EA580C) | Same      | default  |
| Background (hover) | linear-gradient(135deg, #D97706, #C2410C) | Same      | hover    |
| Opacity            | 0.5                                       | 0.5       | disabled |
| Text/Icon          | #FFFFFF                                   | #FFFFFF   | all      |
| Shadow (hover)     | 0 10px 15px -3px rgba(0,0,0,0.1)          | Same      | hover    |

### Error State

When an error occurs, the assistant message displays with the same styling as a regular assistant message, but with error content.

---

## 5. States

### State 1: Popup Closed (Trigger Button Only)

- Fixed position at bottom-right corner
- Gradient background with pulse animation
- Shadow with glow effect
- Hover: scale 1.1, darker gradient, stronger shadow

### State 2: Popup Open - Empty (Initial Message Only)

- Full popup visible with welcome message
- Single assistant message with default greeting:
  - **Content:** "Hi! I'm your AI Load Matching Assistant. I can help you find loads that match your route, equipment, and requirements. Try asking me something like: 'I have a 3-car hauler going from Los Angeles to Dallas, show me available loads.'"
- Input field enabled and ready
- Send button disabled (no text entered)

### State 3: Popup Open - With Messages

- Multiple message bubbles (alternating user/assistant)
- Messages aligned left (assistant) or right (user)
- Each message has avatar + bubble + timestamp
- Automatic scroll to latest message
- Send button enabled when input has text

### State 4: Loading/Typing Indicator

- Three animated dots in assistant bubble style
- Bot avatar visible
- Dots animate with staggered bounce (0ms, 150ms, 300ms delays)
- Input field disabled
- Send button shows spinning loader icon

### State 5: Error State

- Error message appears as assistant message
- Red/warning styling (content-based, no visual difference)
- Input field re-enabled
- Standard assistant bubble styling

---

## 6. Positioning

| Property                    | Value                      |
| --------------------------- | -------------------------- |
| **Position**                | `fixed`                    |
| **Bottom**                  | `24px` (1.5rem / bottom-6) |
| **Right**                   | `24px` (1.5rem / right-6)  |
| **Z-Index**                 | `50`                       |
| **Offset from Bottom Edge** | 24px                       |
| **Offset from Right Edge**  | 24px                       |

**Note:** The popup anchors to the bottom-right corner of the viewport and maintains fixed positioning relative to the window.

---

## 7. Animations & Transitions

### Trigger Button

| Animation    | Property       | Duration | Timing Function              | Other               |
| ------------ | -------------- | -------- | ---------------------------- | ------------------- |
| Pulse        | opacity, scale | 2s       | cubic-bezier(0.4, 0, 0.6, 1) | infinite            |
| Hover Scale  | transform      | 300ms    | ease                         | scale(1.1)          |
| Hover Shadow | box-shadow     | 300ms    | ease                         | shadow-amber-500/50 |

### Popup Open Animation

| Animation | Property   | Duration | Delay | Timing Function   |
| --------- | ---------- | -------- | ----- | ----------------- |
| Slide In  | transform  | 300ms    | 0ms   | ease              |
| Fade In   | opacity    | 300ms    | 0ms   | ease              |
| Direction | translateY | -        | -     | from bottom (4px) |

### Message Appear Animation

| Animation | Property    | Duration | Delay        | Timing Function |
| --------- | ----------- | -------- | ------------ | --------------- |
| Fade In   | opacity     | 300ms    | index × 50ms | ease            |
| Slide In  | translateY  | 300ms    | index × 50ms | ease            |
| Direction | from bottom | -        | 2px          | -               |

**Stagger Calculation:** Each message has `animationDelay: ${index * 50}ms`

### Loading Indicator (Typing Dots)

| Dot   | Animation | Delay |
| ----- | --------- | ----- |
| Dot 1 | bounce    | 0ms   |
| Dot 2 | bounce    | 150ms |
| Dot 3 | bounce    | 300ms |

**Bounce Animation:** Tailwind's default `animate-bounce` (keyframe-based)

### Input Field Focus Animation

| Animation           | Property     | Duration | Timing Function              |
| ------------------- | ------------ | -------- | ---------------------------- |
| Border Color Change | border-color | 150ms    | cubic-bezier(0.4, 0, 0.2, 1) |
| Ring Appear         | box-shadow   | 150ms    | cubic-bezier(0.4, 0, 0.2, 1) |

**Animation Details:**

- **From:** Border color #E5E7EB (light) / #374151 (dark), no ring
- **To:** Border color #F59E0B, 1px amber ring appears
- **Type:** Smooth color fade transition
- **Trigger:** Click or tab into input field
- **Reverse:** Smooth transition back on blur

### Send Button Hover

| Animation      | Property   | Duration | Timing Function |
| -------------- | ---------- | -------- | --------------- |
| Scale          | transform  | 200ms    | ease            |
| Shadow         | box-shadow | 200ms    | ease            |
| Gradient Shift | background | 200ms    | ease            |

**Hover Scale:** `scale(1.05)` (5% larger)

### Message Hover

| Animation        | Property   | Duration | Timing Function |
| ---------------- | ---------- | -------- | --------------- |
| Shadow Elevation | box-shadow | 200ms    | ease            |

**Shadow Change:** `shadow-sm` → `shadow-md`

### Smooth Scrolling

- Auto-scroll to bottom when new message arrives
- Behavior: `smooth`
- Triggered by: new message in array

---

## 8. Interactive Elements

### Input Field

#### Default State

| Property              | Value                              |
| --------------------- | ---------------------------------- |
| **Border Width**      | 1px                                |
| **Border Color**      | #E5E7EB (light) / #374151 (dark)   |
| **Border Style**      | solid                              |
| **Border Radius**     | 0 (rounded-none)                   |
| **Background**        | white (light) / transparent (dark) |
| **Text Color**        | inherited from theme               |
| **Placeholder Color** | muted (theme variable)             |
| **Placeholder Text**  | "Ask about loads on your route..." |

#### Focused State

| Property         | Value                                  |
| ---------------- | -------------------------------------- |
| **Border Width** | 1px (unchanged)                        |
| **Border Color** | #F59E0B (Amber-500)                    |
| **Ring Width**   | 1px                                    |
| **Ring Color**   | #F59E0B (Amber-500)                    |
| **Ring Offset**  | 0px                                    |
| **Outline**      | none (removed default browser outline) |

#### Focus Animation

| Property                | Value                                |
| ----------------------- | ------------------------------------ |
| **Transition Property** | border-color, box-shadow             |
| **Transition Duration** | 150ms                                |
| **Transition Timing**   | cubic-bezier(0.4, 0, 0.2, 1)         |
| **Animation Type**      | Smooth color fade from gray to amber |

#### Disabled State

| Property         | Value               |
| ---------------- | ------------------- |
| **Cursor**       | not-allowed         |
| **Opacity**      | 0.5                 |
| **Background**   | slightly grayed out |
| **Border Color** | unchanged (gray)    |

#### Interaction Behaviors

| Action            | Result                                                    |
| ----------------- | --------------------------------------------------------- |
| **Click / Focus** | Border smoothly transitions to amber, ring appears        |
| **Enter Key**     | Submits message (if input not empty)                      |
| **Blur**          | Border smoothly transitions back to gray, ring disappears |
| **Type**          | Send button becomes enabled when text length > 0          |

### Send Button

| State                   | Visual Specification                              |
| ----------------------- | ------------------------------------------------- |
| **Default**             | Gradient background, Send icon visible            |
| **Hover**               | Scale 1.05, enhanced shadow, darker gradient      |
| **Loading**             | Spinning Loader2 icon replaces Send icon          |
| **Disabled**            | Opacity 0.5, cursor not-allowed, no hover effects |
| **Disabled Conditions** | Loading in progress OR input field is empty       |

### Close Button (X)

| Property         | Specification                          |
| ---------------- | -------------------------------------- |
| **Action**       | Closes the popup, shows trigger button |
| **Hover Effect** | Background: rgba(255,255,255,0.2)      |
| **Icon Size**    | 20px                                   |
| **Transition**   | 200ms ease on all properties           |

### Trigger Button

| Property         | Specification                                               |
| ---------------- | ----------------------------------------------------------- |
| **Action**       | Opens the chatbot popup                                     |
| **Hover Effect** | Scale 1.1, darker gradient, enhanced shadow with amber glow |
| **Icon Size**    | 24px MessageSquare icon                                     |
| **Transition**   | 300ms ease on all properties                                |
| **Animation**    | Continuous pulse animation on idle                          |

### Message List Scrolling

| Property            | Specification                                            |
| ------------------- | -------------------------------------------------------- |
| **Overflow**        | Vertical scroll enabled                                  |
| **Scrollbar Style** | Thin custom scrollbar                                    |
| **Scrollbar Thumb** | Semi-transparent amber (rgba(245,158,11,0.2))            |
| **Scrollbar Track** | Transparent                                              |
| **Auto-Scroll**     | Automatically scrolls to bottom when new message appears |
| **Scroll Behavior** | Smooth animation                                         |

---

## 9. Assets

### Icons

| Icon Name         | Usage                         | Size      | Color                     |
| ----------------- | ----------------------------- | --------- | ------------------------- |
| **MessageSquare** | Trigger button                | 24px      | white                     |
| **Bot**           | Assistant avatar, header icon | 16px-20px | white                     |
| **User**          | User avatar                   | 16px      | white                     |
| **X**             | Close button                  | 20px      | white                     |
| **Send**          | Send button (default state)   | 20px      | white                     |
| **Loader2**       | Send button (loading state)   | 20px      | white (animated spinning) |

### Visual Elements

- **Backgrounds:** CSS gradients (no background images)
- **Icons:** Vector icons (SVG format)
- **Typing Indicator:** Three CSS-based circular dots (8px diameter each)

---

## 10. Responsive Behavior

### Mobile/Small Screen Adjustments

**Current Implementation:**
The component has a **fixed width of 420px** and does **not automatically adjust** for smaller screens.

**Recommended Adjustments for Production:**

| Screen Width | Recommended Changes                                           |
| ------------ | ------------------------------------------------------------- |
| **< 480px**  | Width: `calc(100vw - 32px)`, Max-width: 420px                 |
| **< 480px**  | Bottom: 16px, Right: 16px (reduce from 24px)                  |
| **< 480px**  | Height: `calc(100vh - 100px)` to avoid keyboard overlap       |
| **< 480px**  | Message max-width: 85% (from 75%)                             |
| **< 360px**  | Hide subtitle in header to save space                         |
| **< 360px**  | Reduce padding: header p-4 (from p-5), content p-4 (from p-6) |

### Tablet (480px - 768px)

- Current fixed width (420px) works well
- No adjustments needed

### Desktop (> 768px)

- Current implementation optimal
- Fixed 420px width maintains chat-like feel

**Note:** Current component does not include media queries. The above are recommended enhancements for production deployment.

---

## 11. Accessibility Considerations

| Element                 | Accessibility Feature                               |
| ----------------------- | --------------------------------------------------- |
| **Trigger Button**      | Tooltip: "Open AI Assistant"                        |
| **Input Field**         | Placeholder text provides guidance                  |
| **Send Button**         | Disabled state has visual feedback (opacity 0.5)    |
| **Keyboard Navigation** | Enter key sends message                             |
| **Loading State**       | Visual indicator (animated spinner and typing dots) |
| **Focus States**        | Amber-500 focus ring on input field                 |

**Recommended Additions:**

- ARIA labels for icon-only buttons
- `role="log"` for message container
- `aria-live="polite"` for new messages
- Focus management when popup opens/closes
- Escape key to close popup
- Screen reader announcements for AI responses

---

## End of Specification

**Last Updated:** May 2026  
**Component Version:** 1.0  
**Design System:** Tailwind CSS v4 + Custom Gradients
