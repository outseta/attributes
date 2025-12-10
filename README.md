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

- `o-course` - Course management with lesson completion tracking, video auto-completion, and progress indicators
- `o-list` - Dynamic list filtering and display based on user data

## Building

```bash
npm install
npm run build
```

The built files will be in `dist/`:
- `core.js` - Main library file
- `modules/` - Individual module files

## Development

```bash
npm run dev      # Start development server with watch mode
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

## Adding New Modules

1. Create a new file in `src/modules/`
2. Use the `Attributes.register()` function:

```javascript
Attributes.register('module-name', function() {
  // Your module code here
});
```

3. Rebuild with `npm run build`

## Dependencies

- **Outseta**: Required for user management
- **Modern browsers**: ES6+ support required

## License

MIT
