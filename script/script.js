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

document.addEventListener("DOMContentLoaded", setupImageModal);