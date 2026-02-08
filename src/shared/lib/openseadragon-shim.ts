/**
 * OpenSeadragon shim — re-exports the CDN global so that libraries like
 * @annotorious/openseadragon resolve to the same OSD instance the app uses
 * (loaded via <script> in index.html) instead of the npm module.
 */
const OSD = (window as any).OpenSeadragon;
export default OSD;
