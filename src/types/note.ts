export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  pageSettings?: PageSettings;
  categoryId?: string;
}

export interface PageSettings {
  themeId: string;
  backgroundImageUri?: string;
  backgroundImageOpacity: number;
  backgroundImageFilter?: string;
  backgroundImageBlur?: number;
  marginValue: number;
}
