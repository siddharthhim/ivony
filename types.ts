
export type ImageStyle = 'Realistic' | 'Artistic' | 'Anime' | 'Abstract';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type ActiveTab = 'generate' | 'edit';

export interface AppSettings {
  style: ImageStyle;
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}
