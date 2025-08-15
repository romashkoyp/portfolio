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
        const isTotalRowA = rowA.cells[0].textContent.trim() === window.siteData.ui.buttons.total;
        const isTotalRowB = rowB.cells[0].textContent.trim() === window.siteData.ui.buttons.total;
        
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

// Fetch all data from centralized JSON
const fetchData = async () => {
  const response = await fetch('data/data.json');
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
        <span class="tooltip">${window.siteData.ui.tooltips.certificate}</span>
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
      courseHeader.innerHTML = `${window.siteData.ui.tableHeaders.courseModule} <i class="fa-solid fa-sort"></i>`;
      headerRow.appendChild(courseHeader);
      
      const creditsHeader = document.createElement('th');
      creditsHeader.className = 'sortable';
      creditsHeader.setAttribute('data-sort', 'credits');
      creditsHeader.innerHTML = `${window.siteData.ui.tableHeaders.credits} <i class="fa-solid fa-sort"></i>`;
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
          tooltip.textContent = window.siteData.ui.tooltips.certificate;
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
      totalLabelCell.innerHTML = `<b>${window.siteData.ui.buttons.total}</b>`;
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

const populatePersonalInfo = (data) => {
  // Update page title
  document.title = data.personalInfo.name;
  
  // Update main title and name
  document.querySelector('.title').textContent = data.personalInfo.title;
  const nameElements = document.querySelectorAll('.name');
  const nameParts = data.personalInfo.name.split(' ');
  nameElements[0].textContent = nameParts[0];
  nameElements[1].textContent = nameParts[1];
  
  // Update email links
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => {
    link.href = `mailto:${data.personalInfo.email}`;
  });
  
  // Update contact button text
  const contactButtons = document.querySelectorAll('.contact');
  contactButtons.forEach(button => {
    if (button.innerHTML.includes('fa-envelope')) {
      button.innerHTML = `<i class="fa-solid fa-envelope"></i>${data.ui.buttons.sendEmail}`;
    }
  });
  
  // Update footer copyright
  document.querySelector('footer p').textContent = data.personalInfo.copyright;
}

const populateNavigation = (data) => {
  const navList = document.querySelector('.nav-list');
  navList.innerHTML = '';
  
  data.navigation.links.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.onclick = closeMenu;
    a.href = link.href;
    a.textContent = link.text;
    li.appendChild(a);
    navList.appendChild(li);
  });
}

const populateProfile = (data) => {
  const profileSection = document.getElementById('profile');
  const title = profileSection.querySelector('h2');
  title.textContent = data.profile.title;
  
  // Clear existing paragraphs but keep the title
  const paragraphs = profileSection.querySelectorAll('p, br');
  paragraphs.forEach(p => p.remove());
  
  // Add new paragraphs
  data.profile.paragraphs.forEach((text, index) => {
    const p = document.createElement('p');
    p.textContent = text;
    profileSection.appendChild(p);
    
    if (index < data.profile.paragraphs.length - 1) {
      const br = document.createElement('br');
      profileSection.appendChild(br);
    }
  });
}

const populateSkills = (data) => {
  const skillsSection = document.getElementById('skills');
  const developerTitle = skillsSection.querySelector('.developer');
  developerTitle.textContent = data.skills.title;
  
  const wordsContainers = skillsSection.querySelectorAll('.words');
  
  // Clear existing spans but keep the developer title
  wordsContainers.forEach(container => {
    const spans = container.querySelectorAll('span');
    spans.forEach(span => span.remove());
  });
  
  // Distribute technologies across the three containers
  const techGroups = [
    data.skills.technologies.slice(0, 3), // First 3 technologies
    [{ name: data.skills.title }].concat(data.skills.technologies.slice(3, 5)), // Title + next 2
    data.skills.technologies.slice(5) // Remaining technologies
  ];
  
  techGroups.forEach((group, containerIndex) => {
    group.forEach(tech => {
      if (tech.name !== data.skills.title) { // Skip the title as it's already handled
        const span = document.createElement('span');
        span.textContent = tech.name;
        
        // Apply styles if specified
        if (tech.fontSize) span.style.fontSize = tech.fontSize;
        if (tech.marginTop) span.style.marginTop = tech.marginTop;
        if (tech.marginBottom) span.style.marginBottom = tech.marginBottom;
        
        wordsContainers[containerIndex].appendChild(span);
      }
    });
  });
}

const populateLanguages = (data) => {
  const languagesSection = document.querySelector('.languages');
  
  // Update the title
  const titleDiv = languagesSection.querySelector('.separate_language[style*="background-color: #f1e8f8"]');
  titleDiv.querySelector('h2').textContent = data.languages.title;
  
  // Clear existing language divs except the title
  const languageDivs = languagesSection.querySelectorAll('.separate_language:not([style*="background-color: #f1e8f8"])');
  languageDivs.forEach(div => div.remove());
  
  // Add new language divs
  data.languages.list.forEach(lang => {
    const div = document.createElement('div');
    div.className = 'separate_language';
    
    const h2 = document.createElement('h2');
    h2.textContent = lang.name;
    div.appendChild(h2);
    
    const starsP = document.createElement('p');
    starsP.style.marginBottom = '0.7em';
    
    // Add stars
    for (let i = 1; i <= 6; i++) {
      const star = document.createElement('i');
      star.className = 'fa-solid fa-star';
      star.style.color = i <= lang.stars ? '#ffd43b' : 'lightgrey';
      starsP.appendChild(star);
    }
    div.appendChild(starsP);
    
    const levelP = document.createElement('p');
    levelP.textContent = lang.level;
    div.appendChild(levelP);
    
    languagesSection.appendChild(div);
  });
}

const populateProjects = (data) => {
  // Update projects header
  const projectsHeader = document.getElementById('projects');
  projectsHeader.querySelector('h2').textContent = data.projects.title;
  
  const projectsContainer = document.querySelector('.projects');
  projectsContainer.innerHTML = '';
  
  data.projects.list.forEach(project => {
    const article = document.createElement('article');
    article.className = 'project';
    
    // Screenshot div
    const screenshotDiv = document.createElement('div');
    screenshotDiv.className = 'screenshot';
    
    const screenshotLink = document.createElement('a');
    screenshotLink.href = project.image;
    screenshotLink.target = '_blank';
    
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.imageAlt;
    
    screenshotLink.appendChild(img);
    screenshotDiv.appendChild(screenshotLink);
    article.appendChild(screenshotDiv);
    
    // Project content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'project-content';
    
    const h2 = document.createElement('h2');
    h2.style.textAlign = 'center';
    h2.textContent = project.name;
    contentDiv.appendChild(h2);
    
    const p = document.createElement('p');
    p.textContent = project.description;
    contentDiv.appendChild(p);
    
    article.appendChild(contentDiv);
    
    // Project button
    const button = document.createElement('a');
    button.href = project.url;
    button.className = 'project-button contact';
    button.target = '_blank';
    button.style.width = 'auto';
    button.style.padding = '0 1em';
    button.textContent = project.buttonText;
    
    article.appendChild(button);
    projectsContainer.appendChild(article);
  });
}

const populateSocialLinks = (data) => {
  const footerDiv = document.querySelector('footer div');
  footerDiv.innerHTML = '';
  
  data.ui.socialLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    if (link.url.startsWith('http')) {
      a.target = '_blank';
    }
    
    const i = document.createElement('i');
    i.className = link.icon;
    a.appendChild(i);
    
    footerDiv.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupImageModal();
  
  // Fetch all data first, then populate all sections
  fetchData().then(data => {
    // Store data globally for use in other functions
    window.siteData = data;
    
    populatePersonalInfo(data);
    populateNavigation(data);
    populateProfile(data);
    populateSkills(data);
    populateLanguages(data);
    populateEducationSection(data.education);
    populateProjects(data);
    populateSocialLinks(data);
    
    // Apply sorting after tables have been created
    setupTableSorting();
    
    // Re-setup image modal after projects are populated
    setupImageModal();
  });
});