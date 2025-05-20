import { legacyTimeline } from './data.js';

document.addEventListener('DOMContentLoaded', function() {
  // Set page title
  document.title = "Legacy of Dalai Lama";
  
  // Create year labels around the entity
  createYearLabels();
  
  // Add event listener for entity image click
  const entityImage = document.getElementById('entity-image');
  const yearsContainer = document.getElementById('years-container');
  
  // Create a specific clickable area for the entity (only non-transparent parts)
  entityImage.addEventListener('click', (event) => {
    // Get the canvas pixel data at the click point to check transparency
    const img = event.target;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw the image to the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get the relative position of the click in the image
    const rect = img.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / rect.width * canvas.width);
    const y = Math.round((event.clientY - rect.top) / rect.height * canvas.height);
    
    // Try to get pixel data (this may fail due to CORS)
    try {
      // Check if the pixel at the click position has alpha > 0
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const alpha = pixelData[3]; // Alpha value (0-255)
      
      // Only activate if clicked on a non-transparent part
      if (alpha > 0) {
        event.stopPropagation(); // Prevent body click handler from firing
        entityImage.classList.toggle('active');
        yearsContainer.classList.toggle('active');
      }
    } catch (e) {
      // If image data can't be accessed (e.g., due to CORS), fall back to simple click
      event.stopPropagation();
      entityImage.classList.toggle('active');
      yearsContainer.classList.toggle('active');
    }
  });
  
  // Add event listener for donation icon
  setupDonationIcon();
  
  // Handle clicks outside the entity and years
  document.addEventListener('click', (event) => {
    const summaryCard = document.getElementById('summary-card');
    const donationMenu = document.getElementById('donation-menu');
    const clickedOnYear = event.target.classList.contains('year-label');
    const clickedOnSummary = summaryCard.contains(event.target);
    const clickedOnDonation = document.getElementById('donation-icon').contains(event.target);
    const clickedOnDonationMenu = donationMenu.contains(event.target);
    
    // Hide summary card when clicking outside
    if (!summaryCard.classList.contains('hidden') && !clickedOnYear && !clickedOnSummary) {
      summaryCard.classList.add('hidden');
      // Remove selected class from all year labels
      document.querySelectorAll('.year-label').forEach(label => {
        label.classList.remove('selected');
      });
    }
    
    // Hide donation menu when clicking outside
    if (!donationMenu.classList.contains('hidden') && !clickedOnDonation && !clickedOnDonationMenu) {
      donationMenu.classList.add('hidden');
    }
    
    // Hide years and dim image when clicking outside entity and years
    if (!clickedOnYear && !entityImage.contains(event.target) && !clickedOnSummary && !clickedOnDonation && !clickedOnDonationMenu) {
      entityImage.classList.remove('active');
      yearsContainer.classList.remove('active');
    }
  });
});

function createYearLabels() {
  const yearsContainer = document.getElementById('years-container');
  const numYears = legacyTimeline.length;
  const radius = 250; // Distance from center
  
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
    
    // Store the coordinates for positioning the summary card
    yearLabel.dataset.x = x;
    yearLabel.dataset.y = y;
    
    // Add click event to show summary
    yearLabel.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent closing when clicking on year
      
      // Remove selected class from all year labels
      document.querySelectorAll('.year-label').forEach(label => {
        label.classList.remove('selected');
      });
      
      // Add selected class to the clicked year label
      yearLabel.classList.add('selected');
      
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
  
  donationIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent body click handler from firing
    donationMenu.classList.toggle('hidden');
  });
}