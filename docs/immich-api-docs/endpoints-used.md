# Immich API Endpoints Used in This Application

Based on code analysis, here are the Immich API endpoints currently being used:

## 1. **Assets Endpoints**

### `GET /api/assets/{id}`
- **Purpose**: Fetch metadata for a specific asset
- **Used in**: `metadataService.js`, `server.js` (custom endpoint)
- **Headers Required**: 
  - `X-Api-Key`: API key for authentication
  - `Accept: application/json`
- **Response**: Asset metadata including EXIF information, file details, etc.

### `GET /api/assets/{id}/original`
- **Purpose**: Fetch the original image file
- **Used in**: `ImageViewer.jsx`
- **Headers Required**:
  - `X-Api-Key`: API key for authentication
  - `Accept: image/*`
- **Response**: Binary image data (blob)

## 2. **Albums Endpoints**

### `GET /api/albums`
- **Purpose**: Fetch list of all albums
- **Used in**: `ImageViewer.jsx`, `AlbumList.jsx`
- **Headers Required**:
  - `X-Api-Key`: API key for authentication
  - `Accept: application/json`
- **Response**: Array of album objects

### `GET /api/albums/{id}`
- **Purpose**: Fetch details of a specific album including its assets
- **Used in**: `ImageViewer.jsx`
- **Headers Required**:
  - `X-Api-Key`: API key for authentication
  - `Accept: application/json`
- **Response**: Album details with assets array

## 3. **Proxy Architecture**

The application uses a two-layer proxy system:

### **Layer 1: Express Proxy Server** (`server.js`)
- **Port**: 3000
- **Purpose**: Acts as middleware between frontend and Immich server
- **Features**:
  - CORS handling
  - Request logging
  - Custom endpoint for `/api/assets/{id}` with enhanced error handling
  - General API proxying for all other endpoints

### **Layer 2: Vite Dev Server Proxy** (`vite.config.js`)
- **Port**: 5173
- **Purpose**: Development proxy to avoid CORS issues
- **Configuration**: Proxies `/api` requests to Express server (port 3000)

## 4. **Authentication**

- **API Key**: Stored in `.env` file as `VITE_API_KEY`
- **Header**: `X-Api-Key` sent with all requests
- **Security**: API key is passed through both proxy layers

## 5. **Data Flow**

```
Frontend (React) → Vite Proxy (5173) → Express Proxy (3000) → Immich Server (192.168.1.106:2283)
```

## 6. **Current Limitations**

1. **Missing Endpoints**:
   - No asset upload endpoints
   - No metadata update endpoints (read-only)
   - No album creation/modification endpoints
   - No user management endpoints

2. **Architecture Issues**:
   - Double proxy layer may add latency
   - Express dependencies not in package.json (now fixed)
   - No error handling for offline Immich server

## 7. **Recommended Additional Endpoints**

Based on application functionality, these endpoints would be useful:

- `PUT /api/assets/{id}` - Update asset metadata
- `POST /api/albums` - Create new albums
- `GET /api/search` - Search for assets
- `GET /api/tags` - Fetch tags
- `POST /api/assets/{id}/xmp` - Save XMP annotations

## 8. **Error Handling**

Current error handling includes:
- HTTP status code checking
- Basic error logging
- User-facing error messages for failed requests
- Promise rejection handling for concurrent requests