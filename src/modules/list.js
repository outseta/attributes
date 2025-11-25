// List Filter module - filters list items based on user property values
Attributes.register('o-list', function () {
  // Add CSS to hide empty state elements by default
  if (!document.getElementById('attributes-list-styles')) {
    const style = document.createElement('style');
    style.id = 'attributes-list-styles';
    style.textContent = `
      [data-o-list-element="empty"] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Find all list filter containers
  const filterContainers = document.querySelectorAll('[data-o-list-element="list"]');
  
  filterContainers.forEach(container => {
    Outseta.getUser().then(function (user) {
      // Get configuration from container attributes
      const propertyName = container.getAttribute('data-o-list-property');
      
      if (!propertyName) {
        console.error('List filter: data-o-list-property is required');
        return;
      }

      // Get the property value from user
      const propertyValue = user[propertyName];
      
      // Parse the value - could be a single value, JSON array, or null/undefined
      let filterValues = [];
      
      // Check if property exists and has a meaningful value
      // propertyValue will be undefined if property doesn't exist
      if (propertyValue !== undefined && propertyValue !== null) {
        // Handle string values
        if (typeof propertyValue === 'string') {
          const trimmed = propertyValue.trim();
          if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
            filterValues = [];
          } else {
            // Try to parse as JSON array first
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                filterValues = parsed.length > 0 ? parsed : [];
              } else if (parsed !== null && parsed !== '') {
                // Single value (but not null or empty string)
                filterValues = [parsed];
              }
            } catch (e) {
              // Not JSON, treat as single value
              filterValues = [trimmed];
            }
          }
        } else if (Array.isArray(propertyValue)) {
          // Already an array
          filterValues = propertyValue.length > 0 ? propertyValue : [];
        } else {
          // Other value type (number, boolean, object, etc.)
          filterValues = [propertyValue];
        }
      }

      // Handle empty state elements
      const emptyStateElements = container.querySelectorAll('[data-o-list-element="empty"]');
      
      // Find all list items within this container (children with data-o-list-itemid)
      const listItems = container.querySelectorAll('[data-o-list-itemid]');
      
      if (filterValues.length === 0) {
        // No filter values - show empty state, hide all items
        emptyStateElements.forEach(element => {
          // Override CSS rule with important to show the element
          element.style.setProperty('display', 'block', 'important');
        });
        
        listItems.forEach(item => {
          item.style.setProperty('display', 'none', 'important');
        });
      } else {
        // Hide empty state elements
        emptyStateElements.forEach(element => {
          element.style.setProperty('display', 'none', 'important');
        });
        
        // Show items that match filter values, hide others
        listItems.forEach(item => {
          const itemId = item.getAttribute('data-o-list-itemid');
          
          if (filterValues.includes(itemId)) {
            // Show this item (it matches one of the filter values)
            item.style.setProperty('display', '', 'important');
          } else {
            // Hide this item (it doesn't match)
            item.style.setProperty('display', 'none', 'important');
          }
        });
      }
    });
  });
});

