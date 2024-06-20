using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace FileUpload_JSONConvert.Services
{
    public class MetadataValidationService : IMetadataValidationService
    {
        private const int MaxLength = 255;
        private static readonly Regex ValidKeyRegex = new Regex("^[a-zA-Z0-9_]+$");

        public bool ValidateMetadata(Dictionary<string, string> metadata, out string errorMessage)
        {
            foreach (var item in metadata)
            {
                if (!ValidKeyRegex.IsMatch(item.Key) || item.Key.Length > MaxLength)
                {
                    errorMessage = $"Invalid key: {item.Key}. Keys must be alphanumeric and cannot exceed {MaxLength} characters.";
                    Console.WriteLine($"Metadata validation error: {errorMessage}");
                    return false;
                }

                if (item.Value.Length > MaxLength)
                {
                    errorMessage = $"Value for key {item.Key} exceeds maximum length of {MaxLength} characters.";
                    Console.WriteLine($"Metadata validation error: {errorMessage}");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(item.Value))
                {
                    errorMessage = $"Value for key {item.Key} cannot be empty or whitespace.";
                    Console.WriteLine($"Metadata validation error: {errorMessage}");
                    return false;
                }
            }

            errorMessage = string.Empty;
            return true;
        }
    }

    public interface IMetadataValidationService
    {
        bool ValidateMetadata(Dictionary<string, string> metadata, out string errorMessage);
    }
}