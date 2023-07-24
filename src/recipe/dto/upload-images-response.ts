export class UploadImagesResponse {
  public urls: string[];

  constructor(urls: string[]) {
    this.urls = urls;
  }

  public static from(urls: string[]): UploadImagesResponse {
    return new UploadImagesResponse(urls);
  }
}
