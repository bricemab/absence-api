export default abstract class AbstractEntity {
  hasBeenModified: boolean;

  protected constructor() {
    this.hasBeenModified = false;
  }
}
