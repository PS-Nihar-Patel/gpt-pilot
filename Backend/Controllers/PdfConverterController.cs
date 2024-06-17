using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace FileUpload_JSONConvert.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PdfConverterController : ControllerBase
    {
        [HttpPost("upload")]
        public async Task<IActionResult> UploadPdf(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("No files uploaded.");
            }

            var results = new List<object>();

            foreach (var file in files)
            {
                if (file == null || file.Length == 0)
                {
                    results.Add(new { FileName = file?.FileName, Status = "Failed", Message = "File is empty or not provided." });
                    continue;
                }

                // Validate file type
                if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) || file.ContentType != "application/pdf")
                {
                    results.Add(new { FileName = file.FileName, Status = "Failed", Message = "Only PDF files are allowed." });
                    continue;
                }

                var jsonFilePath = Path.Combine(Path.GetTempPath(), Path.ChangeExtension(Path.GetRandomFileName(), ".json"));

                try
                {
                    using (var stream = new MemoryStream())
                    {
                        await file.CopyToAsync(stream);
                        stream.Position = 0;

                        ConvertPdfToJson(stream, jsonFilePath);
                    }

                    var jsonResult = await System.IO.File.ReadAllTextAsync(jsonFilePath);
                    results.Add(new { FileName = file.FileName, Status = "Success", JsonContent = jsonResult });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred during the conversion process: {ex.Message}");
                    results.Add(new { FileName = file.FileName, Status = "Failed", Message = "An error occurred during conversion." });
                }
                finally
                {
                    if (System.IO.File.Exists(jsonFilePath))
                    {
                        System.IO.File.Delete(jsonFilePath);
                    }
                }
            }

            return Ok(results);
        }

        private void ConvertPdfToJson(Stream pdfStream, string jsonFilePath)
        {
            using (PdfDocument pdfDocument = new PdfDocument(new PdfReader(pdfStream)))
            {
                string text = "";

                for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                {
                    text += PdfTextExtractor.GetTextFromPage(pdfDocument.GetPage(i));
                }

                var jsonData = new
                {
                    document_metadata = new
                    {
                        File_Name = "Uploaded_File"
                    },
                    document_text = text
                };

                string json = JsonConvert.SerializeObject(jsonData);

                // Write JSON to file
                System.IO.File.WriteAllText(jsonFilePath, json);
            }
        }
    }
}
