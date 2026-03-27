import { useParams } from "react-router-dom";
import { Document, Page } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function Reader() {
  const { id } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  
  // Custom container width logic
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width - 40); // 40px for padding
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const fileUrl = `http://localhost:8080/api/books/${id}/file`;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setPdfError(error.message);
  };



  return (
    <div className="main-content">
      <h1 className="page-title">Book Reader</h1>
      <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div ref={containerRef} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-sm)", padding: "20px", width: "100%", maxWidth: "1000px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
          {/* If actual PDF exists, this mounts. A fallback graphic is useful if nothing exists. */}
          <div style={{ minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", color: "var(--text-muted)" }}>
            {pdfError ? (
              <div style={{ color: "#ff4d4f", padding: "20px", textAlign: "center" }}>
                <h3>Failed to load PDF</h3>
                <p>The PDF document could not be retrieved from the server.</p>
                <small>{pdfError}</small>
              </div>
            ) : (
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
                <Page 
                  pageNumber={pageNumber} 
                  width={containerWidth} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false} 
                />
              </Document>
            )}
            {!pdfError && <p style={{ marginTop: "10px" }}>Visualizing Book {id} - Canvas Space</p>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "20px" }}>
          <button
            onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            style={{ opacity: pageNumber <= 1 ? 0.5 : 1 }}>
            Previous
          </button>

          <span style={{ fontSize: "1.1rem", fontWeight: "500" }}>
            Page {pageNumber} {numPages && `of ${numPages}`}
          </span>

          <button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={numPages && pageNumber >= numPages}
            style={{ opacity: (numPages && pageNumber >= numPages) ? 0.5 : 1 }}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}