export default class File {
  name;

  lastModified;

  size;

  constructor(name, lastModified, size) {
    this.name = name;
    this.lastModified = lastModified;
    this.size = size;
  }

  static fromS3Item(item) {
    return new File(item.Key, item.LastModified, item.Size);
  }
}
