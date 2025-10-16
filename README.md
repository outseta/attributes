# Attributes Library

A modular JavaScript library that loads functionality based on HTML attributes, similar to Finsweet's approach. Modules are loaded dynamically only when requested, keeping bundle sizes minimal.

## Usage

Include the library in your HTML and specify which modules you want to use:

```html
<script async type="module" src="https://cdn.jsdelivr.net/npm/@outseta/attributes@latest/dist/core.js" 
  o-course
></script>
```

## How It Works

The library uses a **modular loading system**:
- **Core library** (`core.js`) is lightweight and loads first
- **Modules** are loaded dynamically only when requested via attributes
- **No bundling** - each module is a separate file for optimal caching
- **On-demand loading** - only the modules you need are downloaded

## Available Modules

### `o-course`
Comprehensive course management module that handles lesson completion tracking, video auto-completion, lesson list indicators, redirects, and next lesson navigation.

**Required HTML:**
```html
<div data-o-course-lessonid="lesson-123" 
     data-o-course-completedlessonsprop="MyCompletedLessons" 
     data-o-course-lastlessonprop="MyLastLesson">
  <button data-o-course-element="mark-complete">Mark Complete</button>
  <button data-o-course-element="unmark-complete">Mark Incomplete</button>
</div>
```

**Configuration:**
- **`data-o-course-lessonid`** (required): Unique identifier for the lesson/content item. This should be a unique string that identifies this specific piece of content. In Webflow, the page slug is an excellent choice (e.g., "introduction-to-css", "javascript-basics"). You can also use custom IDs, UUIDs, or any unique identifier that makes sense for your content management system.
- **`data-o-course-completedlessonsprop`** (optional): Specify the name of your Outseta custom property for completed lessons. Defaults to `"CompletedLessons"` if not specified.
- **`data-o-course-lastlessonprop`** (optional): Specify the name of your Outseta custom property for the last completed lesson. Defaults to `"LastLessonCompleted"` if not specified.

**Example:**
```html
<!-- Use default property names -->
<div data-o-course-lessonid="introduction-to-css">
  <button data-o-course-element="mark-complete">Mark Complete</button>
  <button data-o-course-element="unmark-complete">Mark Incomplete</button>
</div>
```

**Features:**
- **Lesson Completion Tracking**: Mark/unmark lesson completion with automatic button state management
- **Video Auto-Completion**: Automatically mark lessons complete when videos finish (supports YouTube, Vimeo, and HTML5 videos)
- **Lesson List Indicators**: Show completion status in lesson lists across the site
- **Session-Based Redirects**: Handle one-time redirects per session
- **Next Lesson Navigation**: Show/hide next lesson links based on completion status
- **FOUC Prevention**: Automatically hides elements initially to prevent flash of unstyled content
- **Outseta Integration**: Seamlessly integrates with Outseta user data and custom properties
- **Flexible Configuration**: Customizable property names for different use cases

#### Video Auto-Completion

Automatically mark lessons complete when videos reach the end or completion threshold (10 seconds from end):

```html
<div data-o-course-lessonid="video-lesson-1">
  <!-- Video wrapper with auto-completion -->
  <div data-o-course-autocompletevideo="true">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
    <!-- or -->
    <iframe src="https://player.vimeo.com/video/VIDEO_ID"></iframe>
    <!-- or -->
    <video controls>
      <source src="lesson-video.mp4" type="video/mp4">
    </video>
  </div>
  
  <button data-o-course-element="mark-complete">Mark Complete</button>
  <button data-o-course-element="unmark-complete">Mark Incomplete</button>
</div>
```

**Supported Video Platforms:**
- **YouTube**: Direct embeds and Embedly embeds
- **Vimeo**: Direct embeds and Embedly embeds  
- **HTML5 Video**: Native `<video>` elements

#### Lesson List Indicators

Show completion status in lesson lists across your site:

```html
<!-- Lesson list item -->
<div data-o-course-lessonlistitemid="lesson-1">
  <h3>Introduction to CSS</h3>
  <div data-o-course-element="lesson-list-item-complete">✓ Complete</div>
  <div data-o-course-element="lesson-list-item-incomplete">○ Incomplete</div>
</div>

<div data-o-course-lessonlistitemid="lesson-2">
  <h3>Advanced CSS</h3>
  <div data-o-course-element="lesson-list-item-complete">✓ Complete</div>
  <div data-o-course-element="lesson-list-item-incomplete">○ Incomplete</div>
</div>
```

#### Next Lesson Navigation

Show/hide next lesson links based on current lesson completion:

```html
<div data-o-course-lessonid="current-lesson">
  <!-- Lesson content -->
  
  <!-- This link will only be visible when current lesson is complete -->
  <a href="/next-lesson" data-o-course-element="next-lesson-link">
    Continue to Next Lesson →
  </a>
</div>
```

#### Session-Based Redirects

Handle one-time redirects that only happen once per session:

```html
<!-- This will redirect once per session, then stop redirecting -->
<div data-o-course-element="redirect">
  <a href="/welcome-page">Go to Welcome Page</a>
</div>

<!-- Or if the element itself is a link -->
<a href="/welcome-page" data-o-course-element="redirect">
  Go to Welcome Page
</a>
```

#### Complete Example

Here's a complete example showing all features working together:

```html
<!-- Lesson page -->
<div data-o-course-lessonid="css-basics" 
     data-o-course-completedlessonsprop="MyCourseProgress" 
     data-o-course-lastlessonprop="LastCompletedLesson">
  
  <!-- Video with auto-completion -->
  <div data-o-course-autocompletevideo="true">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
  </div>
  
  <!-- Manual completion buttons -->
  <button data-o-course-element="mark-complete">Mark Complete</button>
  <button data-o-course-element="unmark-complete">Mark Incomplete</button>
  
  <!-- Next lesson link (only visible when complete) -->
  <a href="/advanced-css" data-o-course-element="next-lesson-link">
    Continue to Advanced CSS →
  </a>
</div>

<!-- Lesson list on another page -->
<div class="lesson-list">
  <div data-o-course-lessonlistitemid="css-basics">
    <h3>CSS Basics</h3>
    <div data-o-course-element="lesson-list-item-complete">✓ Complete</div>
    <div data-o-course-element="lesson-list-item-incomplete">○ Incomplete</div>
  </div>
  
  <div data-o-course-lessonlistitemid="advanced-css">
    <h3>Advanced CSS</h3>
    <div data-o-course-element="lesson-list-item-complete">✓ Complete</div>
    <div data-o-course-element="lesson-list-item-incomplete">○ Incomplete</div>
  </div>
</div>
```

## Building

```bash
npm install
npm run build
```

The built files will be in `dist/`:
- `core.js` - Main library file
- `modules/` - Individual module files

## Development

For development, use the enhanced development workflow:

```bash
# Start development server (builds, watches for changes, and serves files)
npm run dev
```

### Development Tools
- **ESLint**: Code quality and consistency (`npm run lint`)
- **Prettier**: Code formatting (`npm run format`)
- **Build Watcher**: Automatic rebuilds on file changes
- **Pre-commit hooks**: Automatic code quality checks


## Adding New Modules

1. Create a new file in `src/modules/`
2. Use the `Attributes.register()` function:

```javascript
Attributes.register('module-name', function() {
  // Your module code here
});
```

3. Rebuild with `npm run build`
4. The module will be automatically available for dynamic loading

## Dependencies

- **Outseta**: Required for user management (mark-complete module)
- **Modern browsers**: ES6+ support required

## License

MIT
