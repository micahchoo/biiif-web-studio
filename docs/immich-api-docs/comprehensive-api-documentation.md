# Immich API Comprehensive Documentation

## Overview

The Immich API is a REST interface that allows programmatic access to Immich photo management system. This documentation covers the endpoints relevant to the current application and provides guidance for future development.

## Authentication

### API Key Authentication
All API requests require authentication via API key in the `X-Api-Key` header:

```http
GET /api/assets/{id}
X-Api-Key: your_api_key_here
Accept: application/json
```

### JWT Authentication (Alternative)
For user-based authentication, JWT tokens can be used:
```http
Authorization: Bearer {jwt_token}
```

## Core Endpoints Used in Current Application

### 1. Asset Management

#### `GET /api/assets/{id}`
**Purpose**: Retrieve detailed metadata for a specific asset
**Response Format**: JSON object with asset metadata
**Example Response**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "type": "IMAGE",
  "originalFileName": "sunset.jpg",
  "originalMimeType": "image/jpeg",
  "fileCreatedAt": "2023-10-27T09:00:00Z",
  "exifInfo": {
    "make": "Camera Manufacturer",
    "model": "Camera Model",
    "exposureTime": "1/125",
    "fNumber": 2.8,
    "iso": 100,
    "focalLength": 50,
    "lensModel": "50mm f/1.8"
  },
  "isFavorite": false,
  "isArchived": false,
  "tags": [],
  "people": []
}
```

#### `GET /api/assets/{id}/original`
**Purpose**: Retrieve the original asset file (image/video)
**Response Format**: Binary file data
**Headers Required**: `Accept: image/*` or `Accept: video/*`

#### `PUT /api/assets/{id}`
**Purpose**: Update asset metadata
**Request Body**:
```json
{
  "description": "Updated description",
  "isFavorite": true,
  "rating": 5,
  "dateTimeOriginal": "2023-10-27T09:00:00Z",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### 2. Album Management

#### `GET /api/albums`
**Purpose**: Retrieve list of all albums
**Response Format**: Array of album objects
**Example Response**:
```json
[
  {
    "id": "album-123",
    "albumName": "Vacation 2023",
    "description": "Summer vacation photos",
    "albumThumbnailAssetId": "asset-456",
    "createdAt": "2023-07-15T10:30:00Z",
    "updatedAt": "2023-07-20T14:45:00Z",
    "assetCount": 42
  }
]
```

#### `GET /api/albums/{id}`
**Purpose**: Retrieve album details including assets
**Response Format**: Album object with assets array
**Example Response**:
```json
{
  "id": "album-123",
  "albumName": "Vacation 2023",
  "description": "Summer vacation photos",
  "albumThumbnailAssetId": "asset-456",
  "assets": [
    {
      "id": "asset-456",
      "type": "IMAGE",
      "originalFileName": "beach.jpg",
      "fileCreatedAt": "2023-07-15T14:30:00Z"
    }
  ],
  "assetCount": 42
}
```

## Additional Useful Endpoints

### 3. Search and Discovery

#### `GET /api/search`
**Purpose**: Search for assets by various criteria
**Query Parameters**:
- `q`: Search query string
- `type`: Asset type (IMAGE, VIDEO, AUDIO)
- `isFavorite`: Boolean filter
- `takenBefore` / `takenAfter`: Date filters
- `withPeople`: Include/exclude people

#### `GET /api/tags`
**Purpose**: Retrieve all tags
**Response Format**: Array of tag objects

### 4. Asset Operations

#### `POST /api/assets`
**Purpose**: Upload new asset
**Content-Type**: `multipart/form-data`
**Form Fields**:
- `file`: The asset file
- `albumId`: Optional album ID
- `description`: Optional description
- `isFavorite`: Optional favorite flag

#### `DELETE /api/assets`
**Purpose**: Delete assets
**Request Body**:
```json
{
  "ids": ["asset-id-1", "asset-id-2"]
}
```

#### `POST /api/assets/exist`
**Purpose**: Check if assets exist
**Request Body**:
```json
{
  "assetIds": ["asset-id-1", "asset-id-2"]
}
```

### 5. Metadata Operations

#### `PUT /api/assets/{id}/metadata`
**Purpose**: Update EXIF/metadata
**Request Body**:
```json
{
  "exifInfo": {
    "description": "Updated description",
    "keywords": ["vacation", "beach", "summer"],
    "rating": 5,
    "dateTimeOriginal": "2023-07-15T14:30:00Z"
  }
}
```

## Error Handling

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "error": "Error message describing what went wrong",
  "statusCode": 400,
  "message": "Detailed error description",
  "timestamp": "2023-10-27T10:30:00Z"
}
```

## Rate Limiting

- **Default Limit**: 100 requests per minute per API key
- **Headers Included in Responses**:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Best Practices for React Applications

### 1. Request Management
```javascript
// Use fetch with proper headers
const fetchAsset = async (assetId) => {
  const response = await fetch(`/api/assets/${assetId}`, {
    headers: {
      'X-Api-Key': process.env.VITE_API_KEY,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};
```

### 2. Error Handling
```javascript
// Implement comprehensive error handling
try {
  const asset = await fetchAsset(assetId);
} catch (error) {
  if (error.message.includes('401')) {
    // Handle authentication error
    showLoginPrompt();
  } else if (error.message.includes('429')) {
    // Handle rate limiting
    showRateLimitWarning();
  } else {
    // Handle other errors
    showErrorMessage(error.message);
  }
}
```

### 3. Caching Strategy
```javascript
// Implement caching for better performance
const cache = new Map();

const getAssetWithCache = async (assetId) => {
  if (cache.has(assetId)) {
    return cache.get(assetId);
  }
  
  const asset = await fetchAsset(assetId);
  cache.set(assetId, asset);
  return asset;
};
```

### 4. Concurrent Request Management
```javascript
// Use Promise.all for parallel requests with limits
const BATCH_SIZE = 5;

const fetchAssetsInBatches = async (assetIds) => {
  const results = [];
  
  for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
    const batch = assetIds.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(id => fetchAsset(id));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};
```

## Architecture Recommendations for Current Application

### Current Architecture Assessment
The current two-layer proxy architecture (Vite → Express → Immich) has some issues:

**Pros**:
- CORS handling is simplified
- Centralized error handling in Express
- Ability to add custom middleware

**Cons**:
- Added latency from double proxying
- Express dependencies were missing
- Complex deployment requirements

### Recommended Improvements

#### 1. Simplify Proxy Architecture
```javascript
// In vite.config.js - proxy directly to Immich
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.106:2283',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add API key header
            proxyReq.setHeader('X-Api-Key', process.env.VITE_API_KEY);
          });
        }
      }
    }
  }
});
```

#### 2. Implement Service Layer
Create a dedicated service layer for API calls:
```javascript
// src/services/immichApi.js
class ImmichApiService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  async getAsset(assetId) {
    const response = await fetch(`${this.baseUrl}/api/assets/${assetId}`, {
      headers: {
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Add other methods for albums, search, etc.
}
```

#### 3. Add Request Retry Logic
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## Security Considerations

### 1. API Key Protection
- Store API keys in environment variables (`.env` file)
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Input Validation
- Validate all user inputs before sending to API
- Sanitize file names and metadata
- Implement size limits for uploads

### 3. HTTPS Enforcement
- Always use HTTPS in production
- Validate SSL certificates
- Implement HSTS headers

## Performance Optimization

### 1. Image Optimization
- Use thumbnail endpoints when available
- Implement lazy loading for images
- Cache responses appropriately

### 2. Request Optimization
- Batch requests when possible
- Implement request deduplication
- Use conditional requests (ETag, Last-Modified)

### 3. Memory Management
- Clean up unused resources
- Implement pagination for large datasets
- Use streaming for large file downloads

## Testing Strategy

### 1. Unit Tests
```javascript
// Test API service layer
describe('ImmichApiService', () => {
  it('should fetch asset metadata', async () => {
    const service = new ImmichApiService('test-key', 'http://test.api');
    const mockAsset = { id: 'test-id', type: 'IMAGE' };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAsset)
    });
    
    const result = await service.getAsset('test-id');
    expect(result).toEqual(mockAsset);
  });
});
```

### 2. Integration Tests
- Test end-to-end API calls
- Verify error handling
- Test rate limiting behavior

### 3. Performance Tests
- Measure response times
- Test with large datasets
- Verify memory usage

## Deployment Considerations

### 1. Environment Configuration
```env
# .env.production
VITE_API_KEY=production_api_key_here
VITE_IMMICH_URL=https://immich.example.com

# .env.development  
VITE_API_KEY=development_api_key_here
VITE_IMMICH_URL=http://localhost:2283
```

### 2. Build Optimization
- Tree-shake unused dependencies
- Code splitting for different routes
- Optimize asset loading

### 3. Monitoring and Logging
- Implement request logging
- Monitor error rates
- Track performance metrics

## Conclusion

This documentation provides a comprehensive overview of the Immich API as it relates to the current application. The key recommendations are:

1. **Simplify the proxy architecture** to reduce latency
2. **Implement a proper service layer** for API calls
3. **Add comprehensive error handling** and retry logic
4. **Follow security best practices** for API key management
5. **Optimize performance** with caching and request batching

The Immich API is well-documented and provides all necessary endpoints for building a robust photo management application. By following these guidelines, the current application can be made more efficient, secure, and maintainable.