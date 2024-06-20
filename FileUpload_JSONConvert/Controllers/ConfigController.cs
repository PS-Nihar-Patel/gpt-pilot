using Amazon.S3;
using FileUpload_JSONConvert.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace FileUpload_JSONConvert.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IS3Service _s3Service;
        private readonly ILogger<ConfigController> _logger;

        public ConfigController(IS3Service s3Service, ILogger<ConfigController> logger)
        {
            _s3Service = s3Service;
            _logger = logger;
        }

        [HttpPost("vector")]
        public async Task<IActionResult> UploadVectorConfig([FromBody] dynamic vectorConfig, [FromQuery] string bucketName)
        {
            if (bucketName == null)
            {
                _logger.LogWarning("Bucket name is required.");
                return BadRequest("Bucket name is required.");
            }

            try
            {
                string jsonContent = Newtonsoft.Json.JsonConvert.SerializeObject(vectorConfig);
                string key = "vector_config.json"; // Changed to a static file name to overwrite existing data on reupload

                var uploadSuccess = await _s3Service.UploadFileAsync(bucketName, key, jsonContent);
                if (uploadSuccess)
                {
                    _logger.LogInformation($"Successfully uploaded {key} to bucket {bucketName}.");
                    return Ok(new { message = "Vector config uploaded successfully." });
                }
                else
                {
                    _logger.LogError($"Failed to upload {key} to bucket {bucketName}.");
                    return StatusCode(500, new { message = "Failed to upload vector config to S3." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while uploading vector config: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("llm")]
        public async Task<IActionResult> UploadLlmConfig([FromQuery] string bucketName)
        {
            if (string.IsNullOrEmpty(bucketName))
            {
                _logger.LogWarning("Bucket name is required.");
                return BadRequest("Bucket name is required.");
            }

            try
            {
                var llmConfig = new
                {
                    application = "generic",
                    chat_mode = "context",
                    chat_context_qa_prompt_str = "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question\n",
                    query_context_qa_prompt_str = "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question: {query_str}\n",
                    enable_chat = false,
                    openai_qa_prompt_str = "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question: {query_str}\n",
                    similarity_cutoff = 0.5,
                    temperature = 0.8,
                    top_n_results = 10
                };
                string jsonContent = Newtonsoft.Json.JsonConvert.SerializeObject(llmConfig);
                string key = "llm_config.json";

                var uploadSuccess = await _s3Service.UploadFileAsync(bucketName, key, jsonContent);
                if (uploadSuccess)
                {
                    _logger.LogInformation($"Successfully uploaded {key} to bucket {bucketName}.");
                    return Ok(new { message = "LLM config uploaded successfully." });
                }
                else
                {
                    _logger.LogError($"Failed to upload {key} to bucket {bucketName}.");
                    return StatusCode(500, new { message = "Failed to upload LLM config to S3." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while uploading LLM config: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("vectorConfig")]
        public async Task<IActionResult> GetVectorConfig([FromQuery] string bucketName)
        {
            if (string.IsNullOrWhiteSpace(bucketName))
            {
                _logger.LogWarning("Bucket name is required for fetching vector config.");
                return BadRequest("Bucket name is required.");
            }

            try
            {
                var content = await _s3Service.GetFileContentAsync(bucketName, "vector_config.json");
                if (content == null)
                {
                    _logger.LogWarning($"vector_config.json file not found in the specified bucket: {bucketName}.");
                    return NotFound("vector_config.json file not found in the specified bucket.");
                }

                _logger.LogInformation($"Successfully fetched vector_config.json from bucket {bucketName}.");
                return Ok(content);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching vector_config.json from {bucketName}: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching the file.");
            }
        }
    }
}