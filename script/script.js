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
  const images = document.querySelectorAll(".screenshot a img, a[href$='.png'] i");
  
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
};

document.addEventListener('DOMContentLoaded', () => {
  setupImageModal();
  setupTableSorting();
});