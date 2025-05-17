const toggleMenu = () => {
  const nav = document.getElementById("mainNav");
  nav.classList.toggle("responsive");
}

const closeMenu = () => {
  const nav = document.getElementById("mainNav");
  nav.classList.remove("responsive");
}

const toggleElement = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
}

const toggleArrow = (id) => {
  const clickedDiv = document.querySelector(`div[onclick*="${id}"]`);
  const arrow = clickedDiv.querySelector('.arrow');
  if (arrow) {
    arrow.classList.toggle('active');
  }
}

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeButton = document.getElementsByClassName("close-modal")[0];

const setupImageModal = () => {
  // Target project screenshots (certificates are handled separately)
  const images = document.querySelectorAll(".screenshot a img");
  
  images.forEach(img => {
    img.parentElement.addEventListener("click", function(e) {
      e.preventDefault();
      
      const imgUrl = this.getAttribute("href") || this.parentElement.getAttribute("href");
      
      modal.style.display = "block";
      modalImg.src = imgUrl;
      document.body.classList.add("no-scroll");
    });
  });

  closeButton.addEventListener("click", closeModal);
  
  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

const closeModal = () => {
  modal.style.display = "none";
  document.body.classList.remove("no-scroll");
}

// Table sorting functionality
const setupTableSorting = () => {
  document.querySelectorAll('th.sortable').forEach(headerCell => {
    headerCell.addEventListener('click', () => {
      const table = headerCell.closest('table');
      const columnIndex = Array.from(headerCell.parentElement.children).indexOf(headerCell);
      const sortType = headerCell.dataset.sort;
      const sortDirection = headerCell.classList.contains('asc') ? 'desc' : 'asc';
      
      // Reset all headers
      table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
        th.querySelector('i')?.classList.remove('fa-sort-up', 'fa-sort-down');
        th.querySelector('i')?.classList.add('fa-sort');
      });
      
      // Set current header
      headerCell.classList.add(sortDirection);
      const icon = headerCell.querySelector('i');
      icon.classList.remove('fa-sort');
      icon.classList.add(sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
      
      // Get table rows and sort
      const tableBody = table.querySelector('tbody');
      const rows = Array.from(tableBody.rows);
      
      rows.sort((rowA, rowB) => {
        // First check if either row is the total row (by checking first cell content)
        const isTotalRowA = rowA.cells[0].textContent.trim() === 'Total:';
        const isTotalRowB = rowB.cells[0].textContent.trim() === 'Total:';
        
        // Always keep total row at the bottom
        if (isTotalRowA) return 1;
        if (isTotalRowB) return -1;
        
        let valueA, valueB;
        
        if (sortType === 'credits') {
          // For credits column, extract the number for comparison
          valueA = parseInt(rowA.cells[columnIndex].querySelector('span')?.textContent || '0');
          valueB = parseInt(rowB.cells[columnIndex].querySelector('span')?.textContent || '0');
        } else {
          // For text columns
          valueA = rowA.cells[columnIndex].textContent.trim();
          valueB = rowB.cells[columnIndex].textContent.trim();
        }
        
        // Compare based on type and direction
        if (sortType === 'credits') {
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        } else {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
      });
      
      // Reinsert rows in new order
      rows.forEach(row => tableBody.appendChild(row));
    });
  });
}

// Fetch education data from JSON
const fetchEducationData = async () => {
  const response = await fetch('data/education.json');
  return await response.json();
}

const populateEducationSection = (data) => {
  const educationSection = document.getElementById('education');
  
  // Clear existing content but keep the header
  const header = educationSection.querySelector('h2');
  educationSection.innerHTML = '';
  educationSection.appendChild(header);
  
  data.forEach((i, index) => {
    // Create unique ID for each institution based on sanitized name
    const institutionId = `institution-${index}`;
    
    // Create and append elements for each education item
    const itemDiv = document.createElement('div');
    itemDiv.onclick = () => {
      toggleElement(institutionId);
      toggleArrow(institutionId);
    };
    itemDiv.setAttribute('onclick', `toggleElement('${institutionId}'); toggleArrow('${institutionId}')`);
    itemDiv.style.cursor = 'pointer';
    
    const h3 = document.createElement('h3');
    h3.textContent = i.institution;
    
    const arrow = document.createElement('i');
    arrow.classList.add('arrow', 'right');
    
    h3.appendChild(arrow);
    itemDiv.appendChild(h3);
    
    const p = document.createElement('p');
    p.classList.add('p-education');
    p.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-right: 1em;"></i>${i.period}`;
    itemDiv.appendChild(p);
    educationSection.appendChild(itemDiv);
    
    // Create the content div that will be toggled
    const contentDiv = document.createElement('div');
    contentDiv.id = institutionId;
    contentDiv.style.display = 'none';
      // Add degree info
    const degreeP = document.createElement('p');
    degreeP.className = 'course';
    degreeP.textContent = i.degree + " ";
    contentDiv.appendChild(degreeP);
      
      // Add certificate if it exists at the institution level
      if (i.certificate) {
      // Create certificate link with modal functionality
      const certLink = document.createElement('a');
      certLink.href = i.certificate;
      certLink.className = 'certificate-link';
      certLink.style.marginLeft = '8px'; // Add some space between text and icon
      certLink.style.display = 'inline-block'; // Ensure it displays inline
      certLink.innerHTML = `
        <i class="fa-regular fa-file-lines fa-xl"></i>
        <span class="tooltip">Certificate</span>
      `;
      
      // Add modal functionality
      certLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = "block";
        modalImg.src = this.getAttribute("href");
        document.body.classList.add("no-scroll");
      });
      
      // Append the certificate link directly to the degree paragraph instead of creating a new one
      degreeP.appendChild(certLink);
    }
      // Add description if available
    if (i.description) {
      i.description.forEach(desc => {
        const descP = document.createElement('p');
        descP.textContent = desc;
        contentDiv.appendChild(descP);
      });
    }
    
    // Add courses table if available
    if (i.courses && i.courses.length > 0) {
      const table = document.createElement('table');
      table.className = 'course-table';
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const courseHeader = document.createElement('th');
      courseHeader.className = 'sortable';
      courseHeader.setAttribute('data-sort', 'course');
      courseHeader.innerHTML = 'Course Module <i class="fa-solid fa-sort"></i>';
      headerRow.appendChild(courseHeader);
      
      const creditsHeader = document.createElement('th');
      creditsHeader.className = 'sortable';
      creditsHeader.setAttribute('data-sort', 'credits');
      creditsHeader.innerHTML = 'Credits <i class="fa-solid fa-sort"></i>';
      headerRow.appendChild(creditsHeader);
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      // Calculate total credits
      const totalCredits = i.courses.reduce((sum, course) => sum + course.credits, 0);
      
      // Add course rows
      i.courses.forEach(course => {
        const row = document.createElement('tr');
        
        // Course name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = course.course;
        row.appendChild(nameCell);
        
        // Credits cell with certificate if available
        const creditsCell = document.createElement('td');
        const creditsContainer = document.createElement('div');
        creditsContainer.style.display = 'flex';
        creditsContainer.style.flexDirection = 'row';
        creditsContainer.style.alignItems = 'center';
        
        const creditsSpan = document.createElement('span');
        creditsSpan.textContent = course.credits;
        creditsContainer.appendChild(creditsSpan);
          if (course.certificate) {
          const certificateSpan = document.createElement('span');
          const certificateLink = document.createElement('a');
          certificateLink.href = course.certificate;
          certificateLink.className = 'certificate-link';
          
          const icon = document.createElement('i');
          icon.className = 'fa-regular fa-file-lines fa-2xl';
          certificateLink.appendChild(icon);
          
          const tooltip = document.createElement('span');
          tooltip.className = 'tooltip';
          tooltip.textContent = 'Certificate';
          certificateLink.appendChild(tooltip);
          
          // Add modal functionality
          certificateLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = "block";
            modalImg.src = this.getAttribute("href");
            document.body.classList.add("no-scroll");
          });
          
          certificateSpan.appendChild(certificateLink);
          creditsContainer.appendChild(certificateSpan);
        }
        
        creditsCell.appendChild(creditsContainer);
        row.appendChild(creditsCell);
        
        tbody.appendChild(row);
      });
      
      // Add total row
      const totalRow = document.createElement('tr');
      
      const totalLabelCell = document.createElement('td');
      totalLabelCell.innerHTML = '<b>Total:</b>';
      totalRow.appendChild(totalLabelCell);
      
      const totalValueCell = document.createElement('td');
      totalValueCell.innerHTML = `<b>${totalCredits}</b>`;
      totalRow.appendChild(totalValueCell);
      
      tbody.appendChild(totalRow);
      table.appendChild(tbody);
      contentDiv.appendChild(table);
    }
    
    educationSection.appendChild(contentDiv);
    
    // Add separator if not the last item
    if (index < data.length - 1) {
      const br1 = document.createElement('br');
      const hr = document.createElement('hr');
      const br2 = document.createElement('br');
      
      educationSection.appendChild(br1);
      educationSection.appendChild(hr);
      educationSection.appendChild(br2);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupImageModal();
  
  // Fetch education data first, then set up sorting after tables are created
  fetchEducationData().then(data => {
    populateEducationSection(data);
    
    // Apply sorting after tables have been created
    setupTableSorting();
  });
});