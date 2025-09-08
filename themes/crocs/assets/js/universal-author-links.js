// Universal Author Links Handler
document.addEventListener('DOMContentLoaded', function() {
    // Function to check if an author page exists
    async function authorPageExists(authorSlug) {
        try {
            const response = await fetch(`/team/${authorSlug}/`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Function to handle author link clicks
    async function handleAuthorClick(event, authorName, authorSlug) {
        event.preventDefault();
        
        // Show a subtle loading indicator on the clicked link
        const link = event.target;
        const originalText = link.textContent;
        link.style.opacity = '0.6';
        
        try {
            // Check if author page exists
            const pageExists = await authorPageExists(authorSlug);
            
            if (pageExists) {
                // Navigate to the author's team page
                window.location.href = `/team/${authorSlug}/`;
            } else {
                // Navigate to research page with filter
                window.location.href = `/research/#author=${encodeURIComponent(authorSlug)}`;
            }
        } catch (error) {
            // If there's an error checking, default to research page with filter
            console.warn('Error checking author page:', error);
            window.location.href = `/research/#author=${encodeURIComponent(authorSlug)}`;
        } finally {
            // Restore link appearance
            link.style.opacity = '1';
        }
    }

    // Function to attach event listeners to author links
    function attachAuthorListeners() {
        document.querySelectorAll('.author-link').forEach(link => {
            // Remove existing listeners to avoid duplicates
            link.removeEventListener('click', link.authorClickHandler);
            
            // Create and store the handler function
            link.authorClickHandler = function(event) {
                const authorName = this.dataset.author || this.textContent.trim();
                const authorSlug = this.dataset.authorSlug || authorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                handleAuthorClick(event, authorName, authorSlug);
            };
            
            // Attach the event listener
            link.addEventListener('click', link.authorClickHandler);
        });
    }

    // Initial attachment of listeners
    attachAuthorListeners();

    // Re-attach listeners when new content is loaded (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        let shouldReattach = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any added nodes contain author links
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('author-link') || 
                            node.querySelector && node.querySelector('.author-link')) {
                            shouldReattach = true;
                            break;
                        }
                    }
                }
            }
        });
        
        if (shouldReattach) {
            attachAuthorListeners();
        }
    });

    // Observe the entire document for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });

    // Debug: Log how many author links were found
    console.log('Universal Author Links initialized. Found', document.querySelectorAll('.author-link').length, 'author links.');
});