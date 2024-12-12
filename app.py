from flask import Flask, render_template, request, redirect, url_for, send_file, flash
import os
from werkzeug.utils import secure_filename
import PyPDF2
from PyPDF2 import PdfReader
from collections import defaultdict
import zipfile

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Define file upload and output paths
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

def extract_name_from_page(text):
    """Extract the name from the top of the page."""
    lines = text.split('\n')
    return lines[0].strip()

def split_pdf_by_name(input_pdf, output_folder):
    """Split the PDF into individual files grouped by names."""
    with open(input_pdf, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        name_to_pages = defaultdict(list)
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            name = extract_name_from_page(text)
            name_to_pages[name].append(page_num)
        
        # Generate separate PDFs for each group
        zip_file_path = os.path.join(output_folder, 'Split-pdfs.zip')
        with zipfile.ZipFile(zip_file_path, 'w') as zipf:
            for name, page_nums in name_to_pages.items():
                pdf_writer = PyPDF2.PdfWriter()
                for page_num in page_nums:
                    pdf_writer.add_page(pdf_reader.pages[page_num])
                output_pdf = os.path.join(output_folder, f'{name.replace(" ", "_")}.pdf')
                with open(output_pdf, 'wb') as output_file:
                    pdf_writer.write(output_file)
                zipf.write(output_pdf, os.path.basename(output_pdf))
                os.remove(output_pdf)  # Clean up temporary files
        
        return zip_file_path

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Check if a file was uploaded
        if 'file' not in request.files or request.files['file'].filename == '':
            flash('Error: No file uploaded. Please upload a valid PDF.', 'error')
            return redirect(request.url)

        file = request.files['file']
        
        # Validate file type
        if not file.filename.endswith('.pdf') or file.mimetype != 'application/pdf':
            flash('Error: Only PDF files are allowed.', 'error')
            return redirect(request.url)

        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        pdf_name = file.filename
        pdf_reader = PdfReader(file_path)
        page_count = len(pdf_reader.pages)

        # Process PDF
        output_zip = split_pdf_by_name(file_path, app.config['OUTPUT_FOLDER'])
        flash('File processed successfully! Download the result below.', 'success')
        return render_template('result.html', download_url=url_for('download_file', filename=os.path.basename(output_zip)),
                               pdf_name=pdf_name, page_count=page_count)

    return render_template('index.html')

@app.route("/download/<filename>")
def download_file(filename):
    """Download the output zip file."""
    file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    return send_file(file_path, as_attachment=True)

# New route to handle fetching PDF details
@app.route("/get_pdf_details", methods=["POST"])
def get_pdf_details():
    from io import BytesIO
    import base64

    data = request.data
    decoded = base64.b64decode(data.split(b",")[1])
    pdf_file = BytesIO(decoded)
    pdf_reader = PyPDF2.PdfReader(pdf_file)

    pages = len(pdf_reader.pages)
    return {"pages": pages}

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
