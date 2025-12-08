// Mark Complete module - handles lesson completion tracking
Attributes.register('o-course', function () {
  // Add CSS to hide buttons and indicators by default
  if (!document.getElementById('attributes-course-styles')) {
    const style = document.createElement('style');
    style.id = 'attributes-course-styles';
    style.textContent = `
      [data-o-course-element="mark-complete"],
      [data-o-course-element="unmark-complete"],
      [data-o-course-element="lesson-list-item-complete"],
      [data-o-course-element="lesson-list-item-incomplete"] {
        display: none;
      }
      
      [data-o-course-element="next-lesson-link"] {
        pointer-events: none;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Handle redirect elements (only redirect once per session, only for visible elements)
  const processRedirects = () => {
    // Check if we've already redirected from this page in this session
    const redirectKey = `o-course-redirected_${window.location.pathname}`;
    if (sessionStorage.getItem(redirectKey)) {
      return;
    }

    const redirectElements = document.querySelectorAll('[data-o-course-element="redirect"]');
    for (const element of redirectElements) {
      // Skip if element is hidden (e.g., filtered out by o-list)
      if (!isElementVisible(element)) {
        continue;
      }

      // Find the <a> tag within this element (or if this element is an <a> tag itself)
      const link = element.tagName === 'A' ? element : element.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          // Mark that we've redirected from this page
          sessionStorage.setItem(redirectKey, 'true');
          
          // Redirect to the href
          window.location.href = href;
          return; // Stop after first redirect
        }
      }
    }
  };

  // Check if o-list is present on the page
  const oListContainers = document.querySelectorAll('[data-o-list-element="list"]');
  
  if (oListContainers.length > 0) {
    // Wait for o-list to finish filtering, then process redirects
    let listsFiltered = 0;
    const totalLists = oListContainers.length;
    
    oListContainers.forEach(container => {
      container.addEventListener('o-list:filtered', () => {
        listsFiltered++;
        if (listsFiltered >= totalLists) {
          processRedirects();
        }
      }, { once: true });
    });
  } else {
    // No o-list on page, process redirects immediately
    processRedirects();
  }

  // Helper to check if element is visible (not hidden by display:none on self or ancestors)
  function isElementVisible(element) {
    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      if (style.display === 'none') {
        return false;
      }
      element = element.parentElement;
    }
    return true;
  }

  // Find all lesson elements on the page
  const lessonElements = document.querySelectorAll('[data-o-course-lessonid]');

  lessonElements.forEach(wrapper => {
    Outseta.getUser().then(function (user) {
      const lessonId = wrapper.getAttribute('data-o-course-lessonid');
      const markBtn = wrapper.querySelector('[data-o-course-element="mark-complete"]');
      const unmarkBtn = wrapper.querySelector('[data-o-course-element="unmark-complete"]');

      // Get the property names from the wrapper or use defaults
      const completedLessonsProperty =
        wrapper.getAttribute('data-o-course-completedlessonsprop') ||
        'CompletedLessons';
      // Only track last lesson if explicitly configured
      const lastLessonProperty = wrapper.getAttribute('data-o-course-lastlessonprop');

      const data = JSON.parse(user[completedLessonsProperty] || '[]');

      // Video completion detection
      const initializeVideoCompletion = () => {
        // Look for data-o-course-video="autocomplete" anywhere within this lesson wrapper
        const videoWrapper = wrapper.querySelector(
          '[data-o-course-autocompletevideo="true"]'
        );
        if (!videoWrapper) return;

        const completionThreshold = 10;
        let videoAdapter = null;

        // Look for video elements within the video wrapper (not the entire lesson wrapper)
        if (videoWrapper.querySelector('iframe[src*="youtube.com"]')) {
          videoAdapter = new YouTubeVideoAdapter(
            videoWrapper,
            completionThreshold
          );
        } else if (videoWrapper.querySelector('iframe[src*="vimeo.com"]')) {
          videoAdapter = new VimeoVideoAdapter(
            videoWrapper,
            completionThreshold
          );
        } else if (videoWrapper.querySelector('video')) {
          videoAdapter = new HTML5VideoAdapter(
            videoWrapper,
            completionThreshold
          );
        }

        if (videoAdapter) {
          videoAdapter.onComplete(() => {
            // Auto-mark lesson complete when video finishes
            if (!data.includes(lessonId)) {
              data.push(lessonId);

              const updates = {
                [completedLessonsProperty]: JSON.stringify(data),
              };
              if (lastLessonProperty) {
                updates[lastLessonProperty] = lessonId;
              }

              user
                .update(updates)
                .then(() => setComplete(wrapper, markBtn, unmarkBtn));
            }
          });
        } else {
          console.log(
            'No supported video found in video wrapper with data-o-course-video="autocomplete"'
          );
        }
      };

      // Function to update completion indicators in lesson lists
      const updateLessonListIndicators = () => {
        const lessonItems = document.querySelectorAll('[data-o-course-lessonlistitemid]');
        
        lessonItems.forEach(item => {
          const itemLessonId = item.getAttribute('data-o-course-lessonlistitemid');
          const incompleteIndicator = item.querySelector(
            '[data-o-course-element="lesson-list-item-incomplete"]'
          );
          const completeIndicator = item.querySelector(
            '[data-o-course-element="lesson-list-item-complete"]'
          );

          if (data.includes(itemLessonId)) {
            // Lesson is completed - show complete indicator, hide incomplete
            if (incompleteIndicator) {
              incompleteIndicator.style.setProperty('display', 'none', 'important');
            }
            if (completeIndicator) {
              completeIndicator.style.setProperty('display', 'block', 'important');
            }
          } else {
            // Lesson is not completed - show incomplete indicator, hide complete
            if (incompleteIndicator) {
              incompleteIndicator.style.setProperty('display', 'block', 'important');
            }
            if (completeIndicator) {
              completeIndicator.style.setProperty('display', 'none', 'important');
            }
          }
        });
      };

      const setComplete = (wrapper, markBtn, unmarkBtn) => {
        if (markBtn) markBtn.style.display = 'none';
        if (unmarkBtn) unmarkBtn.style.display = 'inline-flex';

        // Show next lesson elements
        const nextLessonElements = document.querySelectorAll(
          '[data-o-course-element="next-lesson-link"]'
        );
        nextLessonElements.forEach(element => {
          element.style.pointerEvents = 'auto';
          element.style.opacity = '1';
        });

        updateLessonListIndicators();
      };

      const unsetComplete = (wrapper, markBtn, unmarkBtn) => {
        if (markBtn) markBtn.style.display = 'inline-flex';
        if (unmarkBtn) unmarkBtn.style.display = 'none';

        // Hide next lesson elements
        const nextLessonElements = document.querySelectorAll(
          '[data-o-course-element="next-lesson-link"]'
        );
        nextLessonElements.forEach(element => {
          // First animate both opacity and transform
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
        });

        updateLessonListIndicators();
      };

      // Initialize video completion detection
      initializeVideoCompletion();

      // Initial state
      if (data.includes(lessonId)) {
        setComplete(wrapper, markBtn, unmarkBtn);
      } else {
        unsetComplete(wrapper, markBtn, unmarkBtn);
      }

      // Ensure lesson list indicators are updated on initial load
      updateLessonListIndicators();

      // Mark complete
      markBtn?.addEventListener('click', () => {
        if (!data.includes(lessonId)) {
          data.push(lessonId);

          // Update completed lessons list (and last lesson ID if configured)
          const updates = {
            [completedLessonsProperty]: JSON.stringify(data),
          };
          if (lastLessonProperty) {
            updates[lastLessonProperty] = lessonId;
          }

          user
            .update(updates)
            .then(() => setComplete(wrapper, markBtn, unmarkBtn));
        }
      });

      // Unmark complete
      unmarkBtn?.addEventListener('click', () => {
        const idx = data.indexOf(lessonId);
        if (idx !== -1) {
          data.splice(idx, 1);

          // Update completed lessons list (use empty string if no lessons, otherwise JSON array)
          const completedValue = data.length > 0 ? JSON.stringify(data) : '';
          user
            .update({ [completedLessonsProperty]: completedValue })
            .then(() => unsetComplete(wrapper, markBtn, unmarkBtn));

          // Note: We don't clear the lastLessonProperty when unmarking
          // as it represents the last lesson that was completed, not necessarily
          // the current state of all lessons
        }
      });
    });
  });
});

// Video adapter classes
class HTML5VideoAdapter {
  constructor(wrapper, completionThreshold) {
    this.video = wrapper.querySelector('video');
    this.completionThreshold = completionThreshold;
    this.onCompleteCallback = null;
    this.isCompleted = false;

    if (this.video) {
      this.initialize();
    }
  }

  initialize() {
    this.video.addEventListener('timeupdate', () => {
      this.checkCompletion();
    });

    this.video.addEventListener('ended', () => {
      this.markComplete();
    });
  }

  checkCompletion() {
    if (this.isCompleted) return;

    const currentTime = this.video.currentTime;
    const duration = this.video.duration;

    if (duration > 0 && duration - currentTime <= this.completionThreshold) {
      this.markComplete();
    }
  }

  markComplete() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
  }
}

class YouTubeVideoAdapter {
  constructor(wrapper, completionThreshold) {
    this.iframe = wrapper.querySelector('iframe[src*="youtube.com"]');
    this.completionThreshold = completionThreshold;
    this.onCompleteCallback = null;
    this.isCompleted = false;
    this.player = null;

    if (this.iframe) {
      this.initialize();
    }
  }

  initialize() {
    console.log('YouTube adapter initializing for:', this.iframe.src);

    // Load YouTube iframe API if not already loaded
    if (!window.YT) {
      console.log('YouTube API not loaded, loading now...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Wait for API to load
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded, creating player...');
        this.createPlayer();
      };
    } else {
      console.log('YouTube API already loaded, creating player...');
      this.createPlayer();
    }
  }

  createPlayer() {
    try {
      console.log('Creating YouTube player for:', this.iframe.src);

      // Check if this is an Embedly embed
      if (this.iframe.src.includes('cdn.embedly.com')) {
        this.handleEmbedlyEmbed();
        return;
      }

      // Extract video ID from iframe src
      const videoId = this.extractVideoId(this.iframe.src);
      if (!videoId) {
        console.log(
          'Could not extract YouTube video ID from:',
          this.iframe.src
        );
        return;
      }

      console.log('Extracted YouTube video ID:', videoId);

      // For standard YouTube embeds, also use the div container approach for consistency
      this.handleStandardEmbed(videoId);
    } catch (e) {
      console.log('YouTube player creation failed:', e);
    }
  }

  handleEmbedlyEmbed() {
    console.log('Detected YouTube Embedly embed, extracting video ID');

    try {
      // Extract YouTube video ID from Embedly URL
      const videoId = this.extractYouTubeIdFromEmbedly(this.iframe.src);

      if (videoId) {
        console.log('Extracted YouTube video ID:', videoId);

        // Create a div container for the YouTube player
        const playerDiv = document.createElement('div');
        playerDiv.id = `youtube-player-${videoId}`;
        playerDiv.style.width = this.iframe.width || '100%';
        playerDiv.style.height = this.iframe.height || '400px';

        // Replace the Embedly iframe with the div container
        this.iframe.parentNode.replaceChild(playerDiv, this.iframe);

        console.log(
          'YouTube player div created, waiting for it to be ready...'
        );

        // Wait a bit for the div to be ready, then create the YouTube player
        setTimeout(() => {
          try {
            console.log(
              'Attempting to create YouTube player in div container...'
            );

            // Create YouTube player in the div container
            this.player = new YT.Player(`youtube-player-${videoId}`, {
              height: this.iframe.height || '400',
              width: this.iframe.width || '100%',
              videoId: videoId,
              events: {
                onStateChange: event => {
                  console.log('YouTube state change:', event.data);
                  this.onPlayerStateChange(event);
                },
                onReady: () => {
                  console.log('YouTube player ready - starting monitoring');
                  this.startProgressMonitoring();
                },
                onError: event => {
                  console.log('YouTube player error:', event.data);
                },
              },
            });

            console.log(
              'YouTube player instance created in div container:',
              this.player
            );

            // Fallback: if onReady doesn't fire within 5 seconds, start monitoring anyway
            setTimeout(() => {
              if (
                this.player &&
                typeof this.player.getCurrentTime === 'function'
              ) {
                console.log(
                  'YouTube player methods available, starting monitoring...'
                );
                this.startProgressMonitoring();
              } else {
                console.log(
                  'YouTube player methods not available, cannot monitor'
                );
              }
            }, 5000);
          } catch (e) {
            console.log('Failed to create YouTube player in div container:', e);
          }
        }, 1000);
      } else {
        console.log('Could not extract YouTube video ID from Embedly URL');
      }
    } catch (e) {
      console.log('Error handling YouTube Embedly embed:', e);
    }
  }

  handleStandardEmbed(videoId) {
    console.log('Handling standard YouTube embed with video ID:', videoId);

    try {
      // Create a div container for the YouTube player
      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-${videoId}`;
      playerDiv.style.width = this.iframe.width || '100%';
      playerDiv.style.height = this.iframe.height || '400px';

      // Replace the existing iframe with the div container
      this.iframe.parentNode.replaceChild(playerDiv, this.iframe);

      console.log(
        'YouTube player div created for standard embed, waiting for it to be ready...'
      );

      // Wait a bit for the div to be ready, then create the YouTube player
      setTimeout(() => {
        try {
          console.log(
            'Attempting to create YouTube player in div container for standard embed...'
          );

          // Create YouTube player in the div container
          this.player = new YT.Player(`youtube-player-${videoId}`, {
            height: this.iframe.height || '400',
            width: this.iframe.width || '100%',
            videoId: videoId,
            events: {
              onStateChange: event => {
                console.log('YouTube state change:', event.data);
                this.onPlayerStateChange(event);
              },
              onReady: () => {
                console.log('YouTube player ready - starting monitoring');
                this.startProgressMonitoring();
              },
              onError: event => {
                console.log('YouTube player error:', event.data);
              },
            },
          });

          console.log(
            'YouTube player instance created in div container for standard embed:',
            this.player
          );

          // Fallback: if onReady doesn't fire within 5 seconds, start monitoring anyway
          setTimeout(() => {
            if (
              this.player &&
              typeof this.player.getCurrentTime === 'function'
            ) {
              console.log(
                'YouTube player methods available, starting monitoring...'
              );
              this.startProgressMonitoring();
            } else {
              console.log(
                'YouTube player methods not available, cannot monitor'
              );
            }
          }, 5000);
        } catch (e) {
          console.log(
            'Failed to create YouTube player in div container for standard embed:',
            e
          );
        }
      }, 1000);
    } catch (e) {
      console.log('Error handling standard YouTube embed:', e);
    }
  }

  extractYouTubeIdFromEmbedly(embedlyUrl) {
    try {
      // Parse the Embedly URL to find the YouTube video ID
      const url = new URL(embedlyUrl);
      const youtubeUrl =
        url.searchParams.get('url') || url.searchParams.get('src');

      if (youtubeUrl) {
        // Extract video ID from YouTube URL
        const match = youtubeUrl.match(
          /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^&\n?#]+)/
        );
        return match ? match[1] : null;
      }

      return null;
    } catch (e) {
      console.log('Error extracting YouTube ID:', e);
      return null;
    }
  }

  extractVideoId(src) {
    // Extract video ID from various YouTube URL formats
    const match = src.match(
      /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/
    );
    const videoId = match ? match[1] : null;
    console.log('YouTube URL parsing:', { src, match, videoId });
    return videoId;
  }

  onPlayerStateChange(event) {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    console.log('YouTube player state changed to:', event.data);

    if (event.data === YT.PlayerState.ENDED) {
      console.log('YouTube video ended - marking complete');
      this.markComplete();
    }
  }

  startProgressMonitoring() {
    console.log('Starting YouTube progress monitoring');

    // Monitor video progress to detect completion threshold
    const checkProgress = () => {
      if (this.isCompleted || !this.player) {
        console.log('YouTube progress check stopped:', {
          isCompleted: this.isCompleted,
          hasPlayer: !!this.player,
        });
        return;
      }

      try {
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();

        console.log('YouTube progress check:', {
          currentTime,
          duration,
          threshold: this.completionThreshold,
        });

        if (
          duration > 0 &&
          duration - currentTime <= this.completionThreshold
        ) {
          console.log(
            'YouTube completion threshold reached - marking complete'
          );
          this.markComplete();
          return;
        }

        // Continue monitoring if not completed
        if (!this.isCompleted) {
          setTimeout(checkProgress, 1000);
        }
      } catch (e) {
        // Fallback to manual completion if API calls fail
        console.log(
          'YouTube API access limited, falling back to manual completion:',
          e
        );
      }
    };

    // Start monitoring after a short delay to ensure player is ready
    setTimeout(checkProgress, 1000);
  }

  markComplete() {
    if (this.isCompleted) return;
    console.log('YouTube markComplete called');
    this.isCompleted = true;

    if (this.onCompleteCallback) {
      console.log('YouTube calling onComplete callback');
      this.onCompleteCallback();
    }
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
    console.log('YouTube onComplete callback set');
  }
}

class VimeoVideoAdapter {
  constructor(wrapper, completionThreshold) {
    this.iframe = wrapper.querySelector('iframe[src*="vimeo.com"]');
    this.completionThreshold = completionThreshold;
    this.onCompleteCallback = null;
    this.isCompleted = false;
    this.player = null;

    if (this.iframe) {
      this.initialize();
    }
  }

  initialize() {
    // Load Vimeo Player SDK if not already loaded
    if (!window.Vimeo) {
      const tag = document.createElement('script');
      tag.src = 'https://player.vimeo.com/api/player.js';
      tag.onload = () => {
        // Wait a bit for the iframe to be ready
        setTimeout(() => this.createPlayer(), 1000);
      };
      document.head.appendChild(tag);
    } else {
      // Wait a bit for the iframe to be ready
      setTimeout(() => this.createPlayer(), 1000);
    }
  }

  createPlayer() {
    try {
      console.log('Creating Vimeo player for:', this.iframe.src);

      // Check if this is an Embedly embed
      if (this.iframe.src.includes('cdn.embedly.com')) {
        this.handleEmbedlyEmbed();
        return;
      }

      // Create Vimeo player instance for direct Vimeo embeds
      this.player = new Vimeo.Player(this.iframe);

      // Set up event listeners
      this.player.on('ended', () => {
        console.log('Vimeo video ended - marking complete');
        this.markComplete();
      });

      this.player.on('timeupdate', data => {
        console.log('Vimeo timeupdate:', data);
        this.checkCompletion(data);
      });

      this.player.on('loaded', () => {
        console.log('Vimeo player loaded - starting monitoring');
        // Player is ready, we can now monitor it
        this.startProgressMonitoring();
      });

      // Also try to get initial duration
      this.player
        .getDuration()
        .then(duration => {
          console.log('Vimeo video duration:', duration);
        })
        .catch(e => {
          console.log('Could not get Vimeo duration:', e);
        });
    } catch (e) {
      console.log('Vimeo player creation failed:', e);
    }
  }

  handleEmbedlyEmbed() {
    console.log('Detected Embedly embed, extracting Vimeo video ID');

    try {
      // Extract Vimeo video ID from Embedly URL
      const videoId = this.extractVimeoIdFromEmbedly(this.iframe.src);

      if (videoId) {
        console.log('Extracted Vimeo video ID:', videoId);

        // Create a new iframe with direct Vimeo embed
        const vimeoIframe = document.createElement('iframe');
        vimeoIframe.src = `https://player.vimeo.com/video/${videoId}`;
        vimeoIframe.width = this.iframe.width || '100%';
        vimeoIframe.height = this.iframe.height || '400';
        vimeoIframe.frameBorder = '0';
        vimeoIframe.allow = 'autoplay; fullscreen; picture-in-picture';

        // Replace the Embedly iframe with direct Vimeo iframe
        this.iframe.parentNode.replaceChild(vimeoIframe, this.iframe);
        this.iframe = vimeoIframe;

        // Wait a bit and then create the Vimeo player
        setTimeout(() => {
          try {
            this.player = new Vimeo.Player(this.iframe);

            // Set up event listeners
            this.player.on('ended', () => {
              console.log('Vimeo video ended - marking complete');
              this.markComplete();
            });

            this.player.on('timeupdate', data => {
              console.log('Vimeo timeupdate:', data);
              this.checkCompletion(data);
            });

            this.player.on('loaded', () => {
              console.log('Vimeo player loaded - starting monitoring');
              this.startProgressMonitoring();
            });

            // Get initial duration
            this.player
              .getDuration()
              .then(duration => {
                console.log('Vimeo video duration:', duration);
              })
              .catch(e => {
                console.log('Could not get Vimeo duration:', e);
              });
          } catch (e) {
            console.log(
              'Failed to create Vimeo player after iframe replacement:',
              e
            );
          }
        }, 1000);
      } else {
        console.log('Could not extract Vimeo video ID from Embedly URL');
      }
    } catch (e) {
      console.log('Error handling Embedly embed:', e);
    }
  }

  extractVimeoIdFromEmbedly(embedlyUrl) {
    try {
      // Parse the Embedly URL to find the Vimeo video ID
      const url = new URL(embedlyUrl);
      const vimeoUrl =
        url.searchParams.get('url') || url.searchParams.get('src');

      if (vimeoUrl) {
        // Extract video ID from Vimeo URL
        const match = vimeoUrl.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
      }

      return null;
    } catch (e) {
      console.log('Error extracting Vimeo ID:', e);
      return null;
    }
  }

  checkCompletion(data) {
    if (this.isCompleted) return;

    // Handle different data structures
    let currentTime, duration;

    if (data && typeof data === 'object') {
      currentTime = data.seconds || data.currentTime;
      duration = data.duration;
    }

    console.log('Vimeo checkCompletion:', {
      currentTime,
      duration,
      threshold: this.completionThreshold,
    });

    if (
      duration > 0 &&
      currentTime > 0 &&
      duration - currentTime <= this.completionThreshold
    ) {
      console.log('Vimeo completion threshold reached - marking complete');
      this.markComplete();
    }
  }

  startProgressMonitoring() {
    // Additional monitoring for edge cases
    const checkProgress = () => {
      if (this.isCompleted || !this.player) return;

      try {
        this.player.getCurrentTime().then(currentTime => {
          this.player.getDuration().then(duration => {
            console.log('Vimeo progress check:', {
              currentTime,
              duration,
              threshold: this.completionThreshold,
            });

            if (
              duration > 0 &&
              duration - currentTime <= this.completionThreshold
            ) {
              console.log(
                'Vimeo progress threshold reached - marking complete'
              );
              this.markComplete();
              return;
            }

            // Continue monitoring if not completed
            if (!this.isCompleted) {
              setTimeout(checkProgress, 1000);
            }
          });
        });
      } catch (e) {
        // Fallback to manual completion if API calls fail
        console.log(
          'Vimeo API access limited, falling back to manual completion'
        );
      }
    };

    // Start monitoring after a short delay to ensure player is ready
    setTimeout(checkProgress, 1000);
  }

  markComplete() {
    if (this.isCompleted) return;
    console.log('Vimeo markComplete called');
    this.isCompleted = true;

    if (this.onCompleteCallback) {
      console.log('Vimeo calling onComplete callback');
      this.onCompleteCallback();
    }
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
    console.log('Vimeo onComplete callback set');
  }
}
