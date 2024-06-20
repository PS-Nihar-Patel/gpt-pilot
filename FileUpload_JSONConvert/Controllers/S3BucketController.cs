using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FileUpload_JSONConvert.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class S3BucketController : ControllerBase
    {
        private readonly IAmazonS3 _s3Client;
        private readonly ILogger<S3BucketController> _logger;

        public S3BucketController(IAmazonS3 s3Client, ILogger<S3BucketController> logger)
        {
            _s3Client = s3Client;
            _logger = logger;
        }

        [HttpGet("{bucketName}/files")]
        public async Task<IActionResult> ListFiles(string bucketName, int pageIndex = 0, int pageSize = 10)
        {
            try
            {
                var request = new ListObjectsV2Request
                {
                    BucketName = bucketName,
                    MaxKeys = pageSize,
                    ContinuationToken = pageIndex > 0 ? pageIndex.ToString() : null
                };

                var response = await _s3Client.ListObjectsV2Async(request);
                var fileNames = new List<string>();

                foreach (var obj in response.S3Objects)
                {
                    fileNames.Add(obj.Key);
                }

                _logger.LogInformation($"Successfully retrieved {fileNames.Count} files from bucket {bucketName}.");
                return Ok(new { Files = fileNames, IsTruncated = response.IsTruncated, NextPageIndex = response.NextContinuationToken });
            }
            catch (AmazonS3Exception e)
            {
                _logger.LogError($"Error encountered on server. Message:'{e.Message}' when listing files from bucket {bucketName}.", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
            catch (Exception e)
            {
                _logger.LogError($"An unexpected error occurred: {e.Message}", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }

        [HttpGet("{bucketName}/files/{fileName}")]
        public async Task<IActionResult> GetFileContent(string bucketName, string fileName)
        {
            try
            {
                var request = new GetObjectRequest
                {
                    BucketName = bucketName,
                    Key = fileName
                };

                using (var response = await _s3Client.GetObjectAsync(request))
                using (var responseStream = response.ResponseStream)
                using (var reader = new StreamReader(responseStream))
                {
                    var content = await reader.ReadToEndAsync();
                    return Ok(content);
                }
            }
            catch (AmazonS3Exception e)
            {
                _logger.LogError($"Error encountered on server. Message: '{e.Message}' when reading file {fileName} from bucket {bucketName}.", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
            catch (Exception e)
            {
                _logger.LogError($"An unexpected error occurred: {e.Message}", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }

        [HttpPut("{bucketName}/files/{fileName}")]
        public async Task<IActionResult> UploadFile(string bucketName, string fileName, [FromBody] string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(jsonContent))
            {
                return BadRequest("JSON content cannot be null or empty.");
            }

            try
            {
                var request = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = fileName,
                    ContentBody = jsonContent,
                    ContentType = "application/json"
                };

                var response = await _s3Client.PutObjectAsync(request);

                _logger.LogInformation($"Successfully uploaded {fileName} to bucket {bucketName}.");
                return Ok($"Successfully uploaded {fileName} to bucket {bucketName}.");
            }
            catch (AmazonS3Exception e)
            {
                _logger.LogError($"Error encountered on server. Message:'{e.Message}' when uploading file {fileName} to bucket {bucketName}.", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
            catch (Exception e)
            {
                _logger.LogError($"An unexpected error occurred: {e.Message}", e);
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}