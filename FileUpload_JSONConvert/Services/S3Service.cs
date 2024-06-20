using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace FileUpload_JSONConvert.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly ILogger<S3Service> _logger;

        public S3Service(IAmazonS3 s3Client, ILogger<S3Service> logger)
        {
            _s3Client = s3Client;
            _logger = logger;
        }

        public async Task<bool> UploadFileAsync(string bucketName, string key, string content)
        {
            try
            {
                var putRequest = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = key,
                    ContentBody = content,
                    ContentType = "application/json"
                };

                var response = await _s3Client.PutObjectAsync(putRequest);
                _logger.LogInformation($"Successfully uploaded {key} to bucket {bucketName}.");
                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (AmazonS3Exception e)
            {
                _logger.LogError($"Error encountered on server when uploading file {key} to bucket {bucketName}. Message: '{e.Message}'", e);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError($"An unexpected error occurred when uploading file {key} to bucket {bucketName}: {ex.Message}", ex);
                return false;
            }
        }

        public async Task<string> GetFileContentAsync(string bucketName, string key)
        {
            try
            {
                var request = new GetObjectRequest
                {
                    BucketName = bucketName,
                    Key = key
                };

                using (var response = await _s3Client.GetObjectAsync(request))
                using (var reader = new StreamReader(response.ResponseStream))
                {
                    var content = await reader.ReadToEndAsync();
                    _logger.LogInformation($"Successfully fetched content for {key} from bucket {bucketName}.");
                    return content;
                }
            }
            catch (AmazonS3Exception e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogError($"File not found: {key} in bucket {bucketName}. Message: '{e.Message}'", e);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching file {key} from bucket {bucketName}: {ex.Message}", ex);
                throw;
            }
        }
    }

    public interface IS3Service
    {
        Task<bool> UploadFileAsync(string bucketName, string key, string content);
        Task<string> GetFileContentAsync(string bucketName, string key);
    }
}