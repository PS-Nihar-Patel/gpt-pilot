using System.Threading.Tasks;

namespace FileUpload_JSONConvert.Services
{
    public interface IS3Service
    {
        Task<bool> UploadFileAsync(string bucketName, string key, string content);
        Task<string> GetFileContentAsync(string bucketName, string key);
    }
}