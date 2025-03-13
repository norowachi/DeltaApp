export interface SearchResponse {
  next: string;
  results: GIF_OBJECT[];
}

export interface CategoryResponse {
  tags: CATEGORY_OBJECT[];
}

export interface GIF_OBJECT {
  //! not all fields are typed
  id: string;
  url: string;
  itemurl: string;
  title: string;
  content_description: string;
  preview: string;
  media_formats: Record<CONTENT_FORMAT, MEDIA_OBJECT>;
}

export type CONTENT_FORMAT =
  | 'preview'
  | 'gif'
  | 'mediumgif'
  | 'tinygif'
  | 'nanogif'
  | 'mp4'
  | 'loopedmp4'
  | 'tinymp4'
  | 'nanomp4'
  | 'webm'
  | 'tinywebm'
  | 'nanowebm'
  | 'webp_transparent'
  | 'tinywebp_transparent'
  | 'nanowebp_transparent'
  | 'gif_transparent'
  | 'tinygif_transparent'
  | 'nanogif_transparent';

export interface MEDIA_OBJECT {
  url: string;
  dims: number[];
  duration: number;
  size: number;
}

export interface CATEGORY_OBJECT {
  searchterm: string;
  path: string;
  image: string;
  name: string;
}
