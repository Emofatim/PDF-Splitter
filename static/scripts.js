const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const browseButton = document.getElementById("browse-button");
const fileDetails = document.getElementById("file-details");
const fileError = document.getElementById("file-error"); 
const fileNameDisplay = document.getElementById("uploaded-file-name");
const filePagesDisplay = document.getElementById("uploaded-file-pages");
const progressSection = document.getElementById("progress-section");
const progressBar = document.getElementById("progress-bar");
const proceedButton = document.querySelector(".proceed-button");

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
  fileError.textContent = "";

  if (file) {
    const fileType = file.type;

    if (fileType !== "application/pdf") {
      fileError.textContent = "Error: Only PDF files are allowed.";
      fileInput.value = ""; // Clear the input
      fileDetails.style.display = "none"; // Hide file details
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      fetch(`/get_pdf_details`, {
        method: "POST",
        body: reader.result,
      })
        .then((response) => response.json())
        .then((data) => {
          fileNameDisplay.innerHTML = `<strong>File Name:</strong> ${file.name}`;
          filePagesDisplay.innerHTML = `<strong>Number of Pages:</strong> ${data.pages}`; 
          fileDetails.style.display = "block";
          uploadArea.style.display = "none";
        });
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById("upload-form").addEventListener("submit", () => {
  progressSection.style.display = "block";
  fileDetails.style.display = "block";
  uploadArea.style.display = "none";
 // window.alert("processed");
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + 10, 100);
    progressBar.value = progress;
    if (progress === 100) clearInterval(interval);
  }, 200);
});

proceedButton.addEventListener("click", (event) => {
  const file = fileInput.files[0];
  const fileError = document.getElementById("file-error"); // Placeholder for error messages

  // Clear previous error messages
  fileError.textContent = "";

  if (!file) {
    fileError.textContent = "Error: No file selected. Please upload a PDF.";
    event.preventDefault(); // Prevent form submission
    return;
  }
});