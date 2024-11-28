const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const browseButton = document.getElementById("browse-button");
const fileDetails = document.getElementById("file-details");
const fileNameDisplay = document.getElementById("uploaded-file-name");
const filePagesDisplay = document.getElementById("uploaded-file-pages");
const progressSection = document.getElementById("progress-section");
const progressBar = document.getElementById("progress-bar");

browseButton.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragging");
});

uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragging"));

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragging");
  fileInput.files = e.dataTransfer.files;
  showFileDetails();
});

fileInput.addEventListener("change", showFileDetails);

function showFileDetails() {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      fetch(`/get_pdf_details`, {
        method: "POST",
        body: reader.result,
      })
        .then((response) => response.json())
        .then((data) => {
          fileNameDisplay.textContent = `File Name: ${file.name}`;
          filePagesDisplay.textContent = `Number of Pages: ${data.pages}`;
          fileDetails.style.display = "block";
        });
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById("upload-form").addEventListener("submit", () => {
  progressSection.style.display = "block";
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + 10, 100);
    progressBar.value = progress;
    if (progress === 100) clearInterval(interval);
  }, 200);
});

// Function to handle file upload
function handleFileUpload(input) {
    const fileInfo = document.getElementById("file-info");
    const browseButton = document.getElementById("browse-button");
    const dropText = document.getElementById("drop-text");
  
    if (input.files.length > 0) {
      const fileName = input.files[0].name;
      fileInfo.textContent = `Uploaded: ${fileName}`;
      fileInfo.style.display = "block"; // Show file name
      browseButton.style.display = "none"; // Hide browse button
      dropText.style.display = "none"; // Hide drop text
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const uploadArea = document.getElementById("upload-area");
    const fileInfo = document.getElementById("file-info");
    const fileNameElement = document.getElementById("uploaded-file-name");
    const pageCountElement = document.getElementById("page-count");
    const progressSection = document.getElementById("progress-section");
  
    fileInput.addEventListener("change", async () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);
  
        // Send file to server for page count
        const response = await fetch("/get_pdf_details", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
  
        // Update UI with file details
        fileNameElement.textContent = file.name;
        pageCountElement.textContent = result.pages;
        uploadArea.style.display = "none";
        fileInfo.style.display = "block";
      }
    });
  
    // Show progress bar on "Proceed" click
    const proceedButton = document.querySelector(".proceed-button");
    proceedButton.addEventListener("click", () => {
      progressSection.style.display = "block";
    });
  });

  