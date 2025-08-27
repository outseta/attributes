# Attributes Library

A modular JavaScript library that loads functionality based on HTML attributes, similar to Finsweet's approach.

## Usage

Include the library in your HTML and specify which modules you want to use:

```html
<script async type="module" src="https://your-cdn.com/attributes.js" 
  o-mark-complete
></script>
```

## Available Modules

### `o-mark-complete`
Tracks lesson completion status with mark/unmark buttons.

**Required HTML:**
```html
<div data-o-lesson-id="lesson-123">
  <button data-o-lesson-action="mark">Mark Complete</button>
  <button data-o-lesson-action="unmark">Mark Incomplete</button>
</div>
```

**Features:**
- Automatically hides both buttons initially (prevents FOUC)
- Shows appropriate button based on completion status
- Integrates with Outseta user data

## Building

```bash
npm install
npm run build
```

The built file will be in `dist/attributes.js`.

## Adding New Modules

1. Create a new file in `src/modules/`
2. Use the `Attributes.register()` function:

```javascript
Attributes.register('module-name', function() {
  // Your module code here
});
```

3. Import it in `src/core.js`
4. Rebuild with `npm run build`

## Dependencies

- **Outseta**: Required for user management (mark-complete module)
- **Modern browsers**: ES6+ support required

## License

MIT
