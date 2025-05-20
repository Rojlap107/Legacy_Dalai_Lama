import { legacyTimeline } from './data.js';

document.addEventListener('DOMContentLoaded', function() {
  // Set page title
  document.title = "Legacy of Dalai Lama";
  
  // Create year labels around the entity
  createYearLabels();
  
  // Add event listeners for entity image interaction (both desktop and mobile)
  const entityImage = document.getElementById('entity-image');
  const entityImageMobile = document.getElementById('entity-image-mobile');
  const yearsContainer = document.getElementById('years-container');
  
  // Add option to pause rotation on hover/touch
  let isRotationPaused = false;
  
  // Detect if the device is touch-enabled
  const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) ||
                         (navigator.msMaxTouchPoints > 0);
  
  // Function to handle entity interaction (both click and touch)
  const handleEntityInteraction = (event) => {
    // Get the canvas pixel data at the interaction point to check transparency
    const img = event.target;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw the image to the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get the relative position of the interaction in the image
    const rect = img.getBoundingClientRect();
    // Use clientX/clientY for mouse events, and use first touch point for touch events
    const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
    const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
    
    const x = Math.round((clientX - rect.left) / rect.width * canvas.width);
    const y = Math.round((clientY - rect.top) / rect.height * canvas.height);
    
    // Try to get pixel data (this may fail due to CORS)
    try {
      // Check if the pixel at the interaction position has alpha > 0
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const alpha = pixelData[3]; // Alpha value (0-255)
      
      // Only activate if interacted with a non-transparent part
      if (alpha > 0) {
        event.stopPropagation(); // Prevent body handler from firing
        entityImage.classList.toggle('active');
        entityImageMobile.classList.toggle('active');
        yearsContainer.classList.toggle('active');
      }
    } catch (e) {
      // If image data can't be accessed (e.g., due to CORS), fall back to simple interaction
      event.stopPropagation();
      entityImage.classList.toggle('active');
      entityImageMobile.classList.toggle('active');
      yearsContainer.classList.toggle('active');
    }
  };
  
  // Add appropriate event listeners based on device type for both images
  entityImage.addEventListener('click', handleEntityInteraction);
  entityImageMobile.addEventListener('click', handleEntityInteraction);
  
  // Add touch events for mobile devices
  if (isTouchDevice) {
    entityImage.addEventListener('touchstart', handleEntityInteraction);
    entityImageMobile.addEventListener('touchstart', handleEntityInteraction);
  }
  
  // Add event listener for donation icon
  setupDonationIcon();
  
  // Function to handle document interactions (both click and touch)
  const handleDocumentInteraction = (event) => {
    const summaryCard = document.getElementById('summary-card');
    const donationMenu = document.getElementById('donation-menu');
    const interactedWithYear = event.target.classList.contains('year-label');
    const interactedWithSummary = summaryCard.contains(event.target);
    const interactedWithDonation = document.getElementById('donation-icon').contains(event.target);
    const interactedWithDonationMenu = donationMenu.contains(event.target);
    
    // Hide summary card when interacting outside
    if (!summaryCard.classList.contains('hidden') && !interactedWithYear && !interactedWithSummary) {
      summaryCard.classList.add('hidden');
      // Remove selected class from all year labels
      document.querySelectorAll('.year-label').forEach(label => {
        label.classList.remove('selected');
      });
    }
    
    // Hide donation menu when interacting outside
    if (!donationMenu.classList.contains('hidden') && !interactedWithDonation && !interactedWithDonationMenu) {
      donationMenu.classList.add('hidden');
    }
    
    // Hide years and dim image when interacting outside entity and years
    const clickedOnEntityDesktop = entityImage.contains(event.target);
    const clickedOnEntityMobile = entityImageMobile.contains(event.target);
    
    if (!interactedWithYear && !clickedOnEntityDesktop && !clickedOnEntityMobile && !interactedWithSummary && !interactedWithDonation && !interactedWithDonationMenu) {
      entityImage.classList.remove('active');
      entityImageMobile.classList.remove('active');
      yearsContainer.classList.remove('active');
    }
  };
  
  // Add appropriate event listeners based on device type
  document.addEventListener('click', handleDocumentInteraction);
  
  // Add touch events for mobile
  if (isTouchDevice) {
    document.addEventListener('touchstart', handleDocumentInteraction);
  }
});

function createYearLabels() {
  const yearsContainer = document.getElementById('years-container');
  const numYears = legacyTimeline.length;
  
  // Adjust radius based on screen size
  let radius = 250; // Default distance from center
  
  // Check window width and adjust radius for different screen sizes
  if (window.innerWidth <= 360) {
    radius = 80; // Very small radius for small phones
  } else if (window.innerWidth <= 480) {
    radius = 90; // Smaller radius for mobile phones
  } else if (window.innerWidth <= 768) {
    radius = 140; // Medium radius for tablets
  }
  
  // Add resize listener to adjust positions when screen size changes
  window.addEventListener('resize', () => {
    updateYearLabelPositions();
  });
  
  function updateYearLabelPositions() {
    let newRadius = 250;
    if (window.innerWidth <= 360) {
      newRadius = 80;
    } else if (window.innerWidth <= 480) {
      newRadius = 90;
    } else if (window.innerWidth <= 768) {
      newRadius = 140;
    }
    
    document.querySelectorAll('.year-label').forEach((label, index) => {
      const angle = (index / numYears) * 2 * Math.PI;
      const x = newRadius * Math.cos(angle);
      const y = newRadius * Math.sin(angle);
      
      label.style.left = `calc(50% + ${x}px)`;
      label.style.top = `calc(50% + ${y}px)`;
      
      // Update stored coordinates
      label.dataset.x = x;
      label.dataset.y = y;
    });
  }
  
  legacyTimeline.forEach((item, index) => {
    // Calculate position on a circle
    const angle = (index / numYears) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    // Create year label
    const yearLabel = document.createElement('div');
    yearLabel.className = 'year-label';
    yearLabel.textContent = item.year;
    yearLabel.style.left = `calc(50% + ${x}px)`;
    yearLabel.style.top = `calc(50% + ${y}px)`;
    yearLabel.dataset.originalAngle = angle;
    
    // Store the coordinates for positioning the summary card
    yearLabel.dataset.x = x;
    yearLabel.dataset.y = y;
    
    // Add hover events to pause rotation if needed
    // This helps make clicking easier
    yearLabel.addEventListener('mouseenter', () => {
      yearLabel.style.zIndex = '20';
    });
    
    yearLabel.addEventListener('mouseleave', () => {
      if (!yearLabel.classList.contains('selected')) {
        yearLabel.style.zIndex = '1';
      }
    });
    
    // Add click event to show summary
    yearLabel.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent closing when clicking on year
      
      // Remove selected class from all year labels
      document.querySelectorAll('.year-label').forEach(label => {
        label.classList.remove('selected');
        if (!label.isEqualNode(yearLabel)) {
          label.style.zIndex = '1';
        }
      });
      
      // Add selected class to the clicked year label
      yearLabel.classList.add('selected');
      yearLabel.style.zIndex = '20';
      
      // Show summary near this year label
      showSummary(item, yearLabel);
    });
    
    yearsContainer.appendChild(yearLabel);
  });
}

function showSummary(item, yearLabel) {
  const summaryCard = document.getElementById('summary-card');
  const summaryContent = document.getElementById('summary-content');
  
  // Set content
  summaryContent.textContent = item.summary;
  
  // Show card
  summaryCard.classList.remove('hidden');
}

function setupDonationIcon() {
  const donationIcon = document.getElementById('donation-icon');
  const donationMenu = document.getElementById('donation-menu');
  
  // Detect if the device is touch-enabled
  const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) ||
                         (navigator.msMaxTouchPoints > 0);
  
  // Function to handle donation icon interaction
  const handleDonationInteraction = (event) => {
    event.stopPropagation(); // Prevent body handler from firing
    event.preventDefault(); // Prevent default for touch
    donationMenu.classList.toggle('hidden');
  };
  
  // Add click event for desktop
  donationIcon.addEventListener('click', handleDonationInteraction);
  
  // Add touch event for mobile devices
  if (isTouchDevice) {
    donationIcon.addEventListener('touchstart', handleDonationInteraction);
    
    // Prevent scrolling when touching the donation links
    document.querySelectorAll('.donation-options a').forEach(link => {
      link.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      });
    });
  }
}