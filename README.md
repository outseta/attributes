# Attributes Library

A modular JavaScript library that loads functionality based on HTML attributes, similar to Finsweet's approach. Modules are loaded dynamically only when requested, keeping bundle sizes minimal.

## Usage

Include the library in your HTML and specify which modules you want to use:

```html
<script async type="module" src="https://cdn.jsdelivr.net/npm/@outseta/attributes@latest/dist/core.js" 
  mark-complete
></script>
```

## How It Works

The library uses a **modular loading system**:
- **Core library** (`core.js`) is lightweight and loads first
- **Modules** are loaded dynamically only when requested via attributes
- **No bundling** - each module is a separate file for optimal caching
- **On-demand loading** - only the modules you need are downloaded

## Available Modules

### `mark-complete`
Tracks lesson completion status with mark/unmark buttons.

**Required HTML:**
```html
<div data-o-lesson-id="lesson-123" data-o-property="MyCustomProperty">
  <button data-o-lesson-action="mark">Mark Complete</button>
  <button data-o-lesson-action="unmark">Mark Incomplete</button>
</div>
```

**Configuration:**
- **`data-o-lesson-id`** (required): Unique identifier for the lesson/content item. This should be a unique string that identifies this specific piece of content. In Webflow, the page slug is an excellent choice (e.g., "introduction-to-css", "javascript-basics"). You can also use custom IDs, UUIDs, or any unique identifier that makes sense for your content management system.
- **`data-o-property`** (optional): Specify the name of your Outseta custom property. Defaults to `"CompletedLessons"` if not specified.

**Example:**
```html
<!-- Use default property name "CompletedLessons" -->
<div data-o-lesson-id="introduction-to-css">
  <button data-o-lesson-action="mark">Mark Complete</button>
  <button data-o-lesson-action="unmark">Mark Incomplete</button>
</div>
```

**Features:**
- Automatically hides both buttons initially (prevents FOUC)
- Shows appropriate button based on completion status
- Integrates with Outseta user data
- Flexible property naming for different use cases
- Clean, logical attribute structure

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
