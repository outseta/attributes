# Course

Build complete course and lesson tracking systems for Webflow with Outseta integration.

The **Course** solution enables you to track lesson completion, display progress indicators, auto-complete lessons on video finish, and automatically redirect users to their current lesson.

---

## Getting Started

### 1. Add the script to your page

Add this `<script>` inside the `<head>` tag of your page or project:

```html
<script async type="module"
  src="https://cdn.jsdelivr.net/npm/@outseta/attributes@latest/dist/core.js"
  o-course
></script>
```

> **Note:** This script requires Outseta to be installed on your site. The user must be logged in for completion tracking to work.

---

## Required Attributes

### Lesson Wrapper

Wrap your lesson in an element with the `lesson` element type and a unique lesson ID.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `lesson` |
| `data-o-course-lessonid` | `{Unique Lesson ID}` |

**Example:**
```html
<div data-o-course-element="lesson" data-o-course-lessonid="lesson-1">
  <!-- Lesson content here -->
</div>
```

---

## Completion Buttons

### Mark Complete Button

Add this attribute to a button that marks the lesson as complete.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `mark-complete` |

### Unmark Complete Button

Add this attribute to a button that unmarks the lesson as complete.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `unmark-complete` |

**Example:**
```html
<div data-o-course-element="lesson" data-o-course-lessonid="lesson-1">
  <button data-o-course-element="mark-complete">Mark as Complete</button>
  <button data-o-course-element="unmark-complete">Completed ✓</button>
</div>
```

> **Note:** These buttons are hidden by default and will be shown/hidden based on the lesson's completion state.

---

## Lesson List Indicators

Display completion status indicators in a lesson list (e.g., sidebar navigation).

### Lesson List Item Wrapper

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `lesson-list-item` |
| `data-o-course-lessonid` | `{Lesson ID}` |

### Complete Indicator

Shown when the lesson is completed.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `lesson-list-item-complete` |

### Incomplete Indicator

Shown when the lesson is not completed.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `lesson-list-item-incomplete` |

**Example:**
```html
<div data-o-course-element="lesson-list-item" data-o-course-lessonid="lesson-1">
  <a href="/lessons/lesson-1">Introduction</a>
  <span data-o-course-element="lesson-list-item-incomplete">○</span>
  <span data-o-course-element="lesson-list-item-complete">✓</span>
</div>
```

> **Note:** The indicators are hidden by default and toggle visibility based on completion status.

---

## Next Lesson Link

Show a link to the next lesson only after the current lesson is marked complete.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `next-lesson-link` |

**Example:**
```html
<div data-o-course-element="lesson" data-o-course-lessonid="lesson-1">
  <!-- Lesson content -->
  <a href="/lessons/lesson-2" data-o-course-element="next-lesson-link">
    Continue to Next Lesson →
  </a>
</div>
```

> **Note:** The element must be inside the `lesson` wrapper. It starts hidden (opacity: 0, pointer-events: none) and becomes visible when the lesson is marked complete.

---

## Auto-Complete on Video Finish

Automatically mark a lesson as complete when the user finishes watching a video.

### Video Wrapper

| Attribute | Value |
|-----------|-------|
| `data-o-course-autocompletevideo` | `true` |

**Supported Video Platforms:**
- YouTube (including Embedly embeds)
- Vimeo (including Embedly embeds)
- HTML5 `<video>` elements

**Example:**
```html
<div data-o-course-element="lesson" data-o-course-lessonid="lesson-1">
  <div data-o-course-autocompletevideo="true">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
  </div>
</div>
```

> **Note:** The lesson is marked complete when the video reaches within 10 seconds of the end, or when the video ends.

---

## Automatic Redirect

Redirect users to their first incomplete lesson automatically. Useful for course landing pages.

| Attribute | Value |
|-----------|-------|
| `data-o-course-element` | `redirect` |

**Example:**
```html
<div data-o-course-element="redirect">
  <a href="/lessons/lesson-3">Continue Course</a>
</div>
```

**Behavior:**
- Redirects to the `href` of the first visible `<a>` tag within the element (or the element itself if it's an `<a>` tag)
- Only redirects once per session per page (stored in sessionStorage)
- Respects visibility — if the element is hidden (e.g., filtered out by `o-list`), it won't redirect

> **Important:** When using with `o-list`, the redirect waits for filtering to complete before evaluating visibility.

---

## Optional Configuration

### Custom Completed Lessons Property

By default, completed lessons are stored in the `CompletedLessons` property on the Outseta user. You can customize this:

| Attribute | Value |
|-----------|-------|
| `data-o-course-completed` | `{Property Name}` |

**Example:**
```html
<div data-o-course-element="lesson"
     data-o-course-lessonid="lesson-1" 
     data-o-course-completed="MyCourseProgress">
  <!-- Lesson content -->
</div>
```

### Track Last Completed Lesson

Optionally track the ID of the last completed lesson:

| Attribute | Value |
|-----------|-------|
| `data-o-course-lastlesson` | `{Property Name}` |

**Example:**
```html
<div data-o-course-element="lesson"
     data-o-course-lessonid="lesson-1"
     data-o-course-lastlesson="LastLesson">
  <!-- Lesson content -->
</div>
```

---

## Integration with o-list

The Course solution integrates seamlessly with `o-list` for filtered lesson lists:

1. Add `o-list` attributes to your lesson list
2. The redirect functionality waits for `o-list:filtered` event before processing
3. Hidden (filtered) items are ignored when determining redirect targets

### o-list Attributes

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-o-list-element` | `list` | Container for the filtered list |
| `data-o-list-property` | `{Property Name}` | Outseta user property containing item IDs to filter by |
| `data-o-list-filter` | `include` or `exclude` | Filter mode (default: `include`) |
| `data-o-list-limit` | `{Number}` | Maximum number of items to show |
| `data-o-list-itemid` | `{Item ID}` | ID on each list item to match against the property values |
| `data-o-list-element` | `empty` | Element shown when no items match the filter |

**Filter Modes:**
- `include` — Only show items whose ID is in the user's property value
- `exclude` — Show all items except those whose ID is in the user's property value

**Example Setup:**
```html
<!-- Lesson list filtered by completed lessons -->
<div data-o-list-element="list"
     data-o-list-property="CompletedLessons"
     data-o-list-filter="exclude"
     data-o-list-limit="3">
  
  <div data-o-list-itemid="lesson-1"
       data-o-course-element="lesson-list-item" 
       data-o-course-lessonid="lesson-1">
    <a href="/lessons/lesson-1" data-o-course-element="redirect">Lesson 1</a>
    <span data-o-course-element="lesson-list-item-incomplete">○</span>
    <span data-o-course-element="lesson-list-item-complete">✓</span>
  </div>
  <!-- More lessons... -->
  
  <div data-o-list-element="empty">
    You've completed all lessons! 🎉
  </div>
</div>
```

> **Note:** The `data-o-list-itemid` should match the `data-o-course-lessonid` value for each item.

---

## Complete Example

### Lesson Page

```html
<div data-o-course-element="lesson" data-o-course-lessonid="lesson-1">
  <h1>Introduction to the Course</h1>
  
  <!-- Video with auto-complete -->
  <div data-o-course-autocompletevideo="true">
    <iframe src="https://player.vimeo.com/video/123456789"></iframe>
  </div>
  
  <!-- Manual completion buttons -->
  <button data-o-course-element="mark-complete">
    Mark as Complete
  </button>
  <button data-o-course-element="unmark-complete">
    Completed ✓ (Click to Undo)
  </button>
  
  <!-- Next lesson (hidden until complete) -->
  <a href="/lessons/lesson-2" data-o-course-element="next-lesson-link">
    Continue to Lesson 2 →
  </a>
</div>
```

### Course Overview / Sidebar

```html
<nav>
  <div data-o-course-element="lesson-list-item" data-o-course-lessonid="lesson-1">
    <a href="/lessons/lesson-1">1. Introduction</a>
    <span data-o-course-element="lesson-list-item-incomplete">○</span>
    <span data-o-course-element="lesson-list-item-complete">✓</span>
  </div>
  
  <div data-o-course-element="lesson-list-item" data-o-course-lessonid="lesson-2">
    <a href="/lessons/lesson-2">2. Getting Started</a>
    <span data-o-course-element="lesson-list-item-incomplete">○</span>
    <span data-o-course-element="lesson-list-item-complete">✓</span>
  </div>
  
  <div data-o-course-element="lesson-list-item" data-o-course-lessonid="lesson-3">
    <a href="/lessons/lesson-3">3. Advanced Topics</a>
    <span data-o-course-element="lesson-list-item-incomplete">○</span>
    <span data-o-course-element="lesson-list-item-complete">✓</span>
  </div>
</nav>
```

---

## Attribute Reference

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-o-course-element` | `lesson` | Wrapper for lesson (required) |
| `data-o-course-lessonid` | `{ID}` | Unique identifier for a lesson (on `lesson` wrapper) |
| `data-o-course-element` | `mark-complete` | Button to mark lesson complete |
| `data-o-course-element` | `unmark-complete` | Button to unmark lesson |
| `data-o-course-element` | `next-lesson-link` | Link shown after completion (must be inside wrapper) |
| `data-o-course-element` | `redirect` | Auto-redirect to linked lesson |
| `data-o-course-element` | `lesson-list-item` | Wrapper for lesson list item |
| `data-o-course-element` | `lesson-list-item-complete` | Completion indicator (shown when done) |
| `data-o-course-element` | `lesson-list-item-incomplete` | Incomplete indicator (shown when not done) |
| `data-o-course-autocompletevideo` | `true` | Enable auto-complete on video finish |
| `data-o-course-completed` | `{Property}` | Custom Outseta property name (default: `CompletedLessons`) |
| `data-o-course-lastlesson` | `{Property}` | Optional property for last completed lesson |

---

## Events

The Course solution listens for the following events:

| Event | Dispatched By | Description |
|-------|---------------|-------------|
| `o-list:filtered` | o-list | Waits for list filtering before processing redirects |

---

## Data Storage

Completion data is stored on the Outseta user object as a JSON array of lesson IDs:

```json
["lesson-1", "lesson-2", "lesson-5"]
```

The property name defaults to `CompletedLessons` but can be customized per-lesson or per-course using `data-o-course-completedlessonsprop`.

